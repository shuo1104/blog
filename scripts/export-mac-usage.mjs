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
const SYNC_DIR = path.join(ROOT_DIR, "data", "sync");
const DB_PATH = path.join(os.homedir(), ".agentsview", "sessions.db");

function formatTokens(tokens) {
  if (tokens >= 1_000_000_000) return (tokens / 1_000_000_000).toFixed(2) + "B";
  if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1) + "M";
  if (tokens >= 1_000) return (tokens / 1_000).toFixed(1) + "K";
  return tokens.toString();
}

async function main() {
  console.log(`\n📦 [Mac Export] Extracting LLM usage from local ~/.agentsview/sessions.db...`);
  await fs.mkdir(SYNC_DIR, { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    console.error(`❌ Cannot find ${DB_PATH}. Please ensure AgentsView is installed on this Mac.`);
    process.exit(1);
  }

  // 1. Extract daily history
  const queryDaily = `
    SELECT
      substr(timestamp, 1, 10) as day,
      count(*) as calls,
      sum(context_tokens + output_tokens) as tokens
    FROM messages
    WHERE timestamp IS NOT NULL AND timestamp != ''
    GROUP BY day
    ORDER BY day ASC;
  `;

  const { stdout: dailyOut } = await execAsync(
    `sqlite3 "${DB_PATH}" "${queryDaily.replace(/\n/g, " ")}"`
  );

  const dailyHistory = [];
  let totalCalls = 0;
  let totalTokens = 0;

  for (const line of dailyOut.trim().split("\n")) {
    if (!line) continue;
    const [date, callsStr, tokensStr] = line.split("|");
    const calls = parseInt(callsStr, 10) || 0;
    const tokens = parseInt(tokensStr, 10) || 0;
    totalCalls += calls;
    totalTokens += tokens;
    dailyHistory.push({ date, calls, tokens });
  }

  // 2. Extract model usage leaderboard
  const queryModels = `
    SELECT
      model,
      count(*) as calls,
      sum(context_tokens + output_tokens) as tokens
    FROM messages
    WHERE model IS NOT NULL AND model != '' AND model != '<synthetic>'
    GROUP BY model
    ORDER BY tokens DESC;
  `;

  const { stdout: modelsOut } = await execAsync(
    `sqlite3 "${DB_PATH}" "${queryModels.replace(/\n/g, " ")}"`
  );

  const models = [];
  for (const line of modelsOut.trim().split("\n")) {
    if (!line) continue;
    const [name, callsStr, tokensStr] = line.split("|");
    const calls = parseInt(callsStr, 10) || 0;
    const tokens = parseInt(tokensStr, 10) || 0;
    models.push({
      name,
      calls,
      tokens,
      tokensFormatted: formatTokens(tokens),
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEntry = dailyHistory.find((d) => d.date === todayStr) || {
    date: todayStr,
    calls: 0,
    tokens: 0,
  };

  // 3. Payload: Standard Transfer Schema
  const exportPayload = {
    version: "1.0",
    source: "Macbook-AgentsView",
    exportedAt: new Date().toISOString(),
    summary: {
      totalCalls,
      totalTokens,
      totalTokensFormatted: formatTokens(totalTokens),
      activeDays: dailyHistory.length,
      today: todayEntry,
    },
    topModels: models,
    dailyHistory,
  };

  // Write full transfer export
  const exportFile = path.join(SYNC_DIR, "agentsview-export.json");
  await fs.writeFile(exportFile, JSON.stringify(exportPayload, null, 2), "utf-8");

  // Also write daily incremental file
  const dailyFile = path.join(SYNC_DIR, `daily-${todayStr}.json`);
  await fs.writeFile(
    dailyFile,
    JSON.stringify(
      {
        date: todayStr,
        calls: todayEntry.calls,
        tokens: todayEntry.tokens,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`✓ Exported ${totalCalls} calls (${formatTokens(totalTokens)} tokens)`);
  console.log(`📁 Ready for VPS transfer: ${exportFile}`);
  console.log(`📁 Daily increment: ${dailyFile}\n`);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
