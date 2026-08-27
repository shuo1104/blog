import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const SYNC_DIR = path.join(ROOT_DIR, "data", "sync");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const EXPORT_FILE = path.join(SYNC_DIR, "agentsview-export.json");
const OUTPUT_PUBLIC = path.join(PUBLIC_DIR, "agentsview-usage.json");
const OUTPUT_DIST = path.join(DIST_DIR, "agentsview-usage.json");

function formatTokens(tokens) {
  if (tokens >= 1_000_000_000) return (tokens / 1_000_000_000).toFixed(2) + "B";
  if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1) + "M";
  if (tokens >= 1_000) return (tokens / 1_000).toFixed(1) + "K";
  return tokens.toString();
}

function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}

async function main() {
  console.log(`\n⚙️ [VPS Processing] Scanning ${SYNC_DIR} for incoming LLM usage data...`);

  let exportData = null;

  try {
    const raw = await fs.readFile(EXPORT_FILE, "utf-8");
    exportData = JSON.parse(raw);
  } catch {
    console.warn(`⚠ ${EXPORT_FILE} not found or invalid. Checking for existing public snapshot...`);
  }

  if (!exportData || !exportData.dailyHistory) {
    console.error(`❌ No valid transfer data found in ${EXPORT_FILE}`);
    process.exit(1);
  }

  const dailyMap = new Map();
  for (const item of exportData.dailyHistory) {
    dailyMap.set(item.date, {
      calls: item.calls || 0,
      tokens: item.tokens || 0,
    });
  }

  // Generate 53 weeks (371 days) Sunday-aligned rolling heatmap matrix
  const today = new Date();
  const totalDays = 53 * 7;
  const startSunday = new Date(today);
  startSunday.setDate(startSunday.getDate() - (totalDays - 1));
  const dayOfWeek = startSunday.getDay();
  if (dayOfWeek !== 0) {
    startSunday.setDate(startSunday.getDate() - dayOfWeek);
  }

  const contributions = [];
  let totalEvents = 0;
  let totalTokens = 0;

  const cursor = new Date(startSunday);
  while (cursor <= today || contributions.length < totalDays) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const usage = dailyMap.get(dateStr);
    const count = usage ? usage.calls : 0;
    const tokens = usage ? usage.tokens : 0;

    totalEvents += count;
    totalTokens += tokens;

    let level = 0;
    if (count > 0) {
      if (tokens > 100_000_000 || count >= 1500) level = 4;
      else if (tokens > 40_000_000 || count >= 700) level = 3;
      else if (tokens > 10_000_000 || count >= 200) level = 2;
      else level = 1;
    }

    contributions.push({
      date: dateStr,
      count,
      tokens,
      level,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  // Format Top 8 Models for Drawer
  const repos = (exportData.topModels || []).slice(0, 8).map((m) => ({
    name: m.name,
    count: `${m.tokensFormatted || formatTokens(m.tokens)} Tokens (${formatNumber(m.calls)} calls)`,
    href: "#",
  }));

  const finalOutput = {
    updatedAt: new Date().toISOString(),
    agentName: "AgentsView AI Desktop",
    totalEvents,
    totalTokens,
    totalTokensFormatted: formatTokens(totalTokens),
    contributions,
    repos,
  };

  // 1. Write to public/
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_PUBLIC, JSON.stringify(finalOutput, null, 2), "utf-8");
  console.log(`✓ Updated public snapshot: ${OUTPUT_PUBLIC}`);

  // 2. Write directly to dist/ if it exists (live zero-rebuild update on VPS)
  try {
    await fs.access(DIST_DIR);
    await fs.writeFile(OUTPUT_DIST, JSON.stringify(finalOutput, null, 2), "utf-8");
    console.log(`✨ Live web server updated (0 rebuild): ${OUTPUT_DIST}`);
  } catch (_) {
    // dist directory does not exist yet, which is fine
  }

  console.log(`🎉 Ingestion complete: ${formatNumber(totalEvents)} calls (${formatTokens(totalTokens)} tokens) ready on VPS!\n`);
}

main().catch((err) => {
  console.error("VPS Ingestion failed:", err);
  process.exit(1);
});
