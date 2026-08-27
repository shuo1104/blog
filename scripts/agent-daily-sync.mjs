import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const SCRIPTS_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const GITHUB_JSON = path.join(PUBLIC_DIR, "github-contributions.json");
const AGENTSVIEW_JSON = path.join(PUBLIC_DIR, "agentsview-usage.json");

async function runStep(label, cmd) {
  console.log(`\n⏳ [Step] ${label}...`);
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: ROOT_DIR });
    if (stdout.trim()) console.log(stdout.trim());
    if (stderr.trim()) console.warn(stderr.trim());
    return true;
  } catch (err) {
    console.error(`❌ [Error in ${label}]:`, err.message);
    return false;
  }
}

async function validateJson(filePath, name) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (!parsed) throw new Error("Empty JSON");
    return parsed;
  } catch (err) {
    console.error(`❌ Validation failed for ${name}:`, err.message);
    return null;
  }
}

async function main() {
  const startTime = new Date();
  const dateStr = startTime.toISOString().slice(0, 10);
  console.log(`\n🤖 ==========================================`);
  console.log(`🤖 Agent Daily Sync Pipeline Starting (${dateStr})`);
  console.log(`🤖 ==========================================`);

  // Step 1: Sync GitHub Contributions
  const step1Ok = await runStep(
    "Fetching GitHub Contributions",
    `node "${path.join(SCRIPTS_DIR, "sync-contributions.mjs")}"`
  );

  // Step 2: Sync AgentsView Usage
  const step2Ok = await runStep(
    "Extracting AgentsView Local Usage",
    `node "${path.join(SCRIPTS_DIR, "sync-agentsview.mjs")}"`
  );

  // Step 3: Validate Outputs
  console.log(`\n🔍 [Validation] Checking generated data files...`);
  const ghData = await validateJson(GITHUB_JSON, "github-contributions.json");
  const avData = await validateJson(AGENTSVIEW_JSON, "agentsview-usage.json");

  const ghContributions = ghData?.users?.shuo1104?.totalContributions ?? 0;
  const avEvents = avData?.totalEvents ?? 0;
  const avTokens = avData?.totalTokensFormatted ?? "0";

  console.log(`  ✓ GitHub (shuo1104): ${ghContributions} contributions`);
  console.log(`  ✓ AgentsView: ${avEvents} agent calls (${avTokens} tokens)`);

  // Step 4: Commit & Push to Remote Git Server (if inside git repo)
  console.log(`\n📦 [Git Deploy] Checking for data changes...`);
  try {
    const { stdout: statusOut } = await execAsync(
      `git status --porcelain public/github-contributions.json public/agentsview-usage.json`,
      { cwd: ROOT_DIR }
    );

    if (statusOut.trim()) {
      console.log(`  📝 Detected updated data files:\n${statusOut.trim()}`);
      await execAsync(
        `git add public/github-contributions.json public/agentsview-usage.json`,
        { cwd: ROOT_DIR }
      );
      
      const commitMsg = `chore(data): auto-sync github and agentsview metrics [${dateStr}]`;
      await execAsync(`git commit -m "${commitMsg}"`, { cwd: ROOT_DIR });
      console.log(`  ✓ Committed: "${commitMsg}"`);

      // Try pushing if remote exists
      try {
        console.log(`  🚀 Pushing to remote repository...`);
        const { stdout: pushOut } = await execAsync(`git push`, { cwd: ROOT_DIR });
        if (pushOut.trim()) console.log(`  ${pushOut.trim()}`);
        console.log(`  ✓ Successfully pushed to remote! Server deployment triggered.`);
      } catch (pushErr) {
        console.warn(`  ℹ Remote push skipped or failed (offline/no remote):`, pushErr.message);
      }
    } else {
      console.log(`  ✓ No data changes detected. Files are already up to date.`);
    }
  } catch (gitErr) {
    console.warn(`  ℹ Git operation skipped:`, gitErr.message);
  }

  const durationSec = ((new Date().getTime() - startTime.getTime()) / 1000).toFixed(1);
  console.log(`\n🎉 ==========================================`);
  console.log(`🎉 Agent Daily Sync Completed in ${durationSec}s!`);
  console.log(`🎉 Stats Summary:`);
  console.log(`   - Date: ${dateStr}`);
  console.log(`   - GitHub Contributions: ${ghContributions}`);
  console.log(`   - AgentsView Calls: ${avEvents} (${avTokens} Tokens)`);
  console.log(`🎉 ==========================================\n`);
}

main().catch((err) => {
  console.error("Fatal Error in Agent Daily Sync:", err);
  process.exit(1);
});
