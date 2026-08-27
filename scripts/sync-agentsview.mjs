import fs from "fs/promises";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const OUTPUT_FILE = path.join(PUBLIC_DIR, "agentsview-usage.json");
const DB_PATH = path.join(os.homedir(), ".agentsview", "sessions.db");

function formatTokens(tokens) {
  if (tokens >= 1_000_000_000) return (tokens / 1_000_000_000).toFixed(2) + "B";
  if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1) + "M";
  if (tokens >= 1_000) return (tokens / 1_000).toFixed(1) + "K";
  return tokens.toString();
}

function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}

async function extractFromLocalDatabase() {
  try {
    await fs.access(DB_PATH);
  } catch {
    console.warn(`[AgentsView] sessions.db not found at ${DB_PATH}`);
    return null;
  }

  try {
    // 1. Query full daily messages & tokens from `messages` table
    const queryDaily = `
      SELECT
        substr(timestamp, 1, 10) as day,
        count(*) as events,
        sum(context_tokens + output_tokens) as tokens
      FROM messages
      WHERE timestamp IS NOT NULL AND timestamp != ''
      GROUP BY day
      ORDER BY day ASC;
    `;

    const { stdout: dailyOut } = await execAsync(
      `sqlite3 "${DB_PATH}" "${queryDaily.replace(/\n/g, " ")}"`
    );

    const dailyMap = new Map();
    let maxTokensInDay = 1;

    for (const line of dailyOut.trim().split("\n")) {
      if (!line) continue;
      const [day, eventsStr, tokensStr] = line.split("|");
      const events = parseInt(eventsStr, 10) || 0;
      const tokens = parseInt(tokensStr, 10) || 0;
      if (tokens > maxTokensInDay) maxTokensInDay = tokens;
      dailyMap.set(day, { events, tokens });
    }

    // 2. Query top AI models including all GPT, Claude, DeepSeek, GLM, Kimi, Gemini models
    const queryModels = `
      SELECT
        model,
        count(*) as events,
        sum(context_tokens + output_tokens) as tokens
      FROM messages
      WHERE model IS NOT NULL AND model != '' AND model != '<synthetic>'
      GROUP BY model
      ORDER BY tokens DESC
      LIMIT 8;
    `;

    const { stdout: modelsOut } = await execAsync(
      `sqlite3 "${DB_PATH}" "${queryModels.replace(/\n/g, " ")}"`
    );

    const topModels = [];
    for (const line of modelsOut.trim().split("\n")) {
      if (!line) continue;
      const [model, eventsStr, tokensStr] = line.split("|");
      const events = parseInt(eventsStr, 10) || 0;
      const tokens = parseInt(tokensStr, 10) || 0;
      topModels.push({
        name: model,
        count: `${formatTokens(tokens)} Tokens (${formatNumber(events)} calls)`,
        href: "#",
      });
    }

    // 3. Generate past 53 weeks (371 days) matrix aligned to Sunday
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
      const count = usage ? usage.events : 0;
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

    return {
      updatedAt: new Date().toISOString(),
      agentName: "AgentsView AI Desktop",
      totalEvents,
      totalTokens,
      totalTokensFormatted: formatTokens(totalTokens),
      contributions,
      repos: topModels,
    };
  } catch (err) {
    console.error("[AgentsView] Failed to query SQLite database:", err);
    return null;
  }
}

async function main() {
  console.log(`\n🤖 Extracting FULL Coding Agent usage (GPT, Claude, DeepSeek, Kimi, Gemini) from ~/.agentsview/sessions.db...`);
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  const data = await extractFromLocalDatabase();
  if (data) {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✓ Successfully extracted ${data.totalEvents} agent interactions (${data.totalTokensFormatted} tokens)!`);
    console.log(`✨ Written to: ${OUTPUT_FILE}\n`);
  } else {
    console.warn("⚠ Could not read local AgentsView database. Keeping existing snapshot.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
