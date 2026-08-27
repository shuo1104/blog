import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const OUTPUT_FILE = path.join(PUBLIC_DIR, "github-contributions.json");

const TARGET_USERS = (
  process.env.GITHUB_USERNAMES
    ? process.env.GITHUB_USERNAMES.split(",").map((s) => s.trim())
    : process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : ["shuo1104"]
).filter(Boolean);

const GITHUB_TOKEN = process.env.GH_PAT || process.env.GITHUB_TOKEN || "";

const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/**
 * Fetch contribution calendar using GitHub official GraphQL API (Supports private contributions)
 */
async function fetchViaGraphQL(username) {
  if (!GITHUB_TOKEN) return null;

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "shuo-blog-contributions-sync",
      },
      body: JSON.stringify({ query, variables: { login: username } }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;

    const days = [];
    for (const week of calendar.weeks || []) {
      for (const day of week.contributionDays || []) {
        days.push({
          date: day.date,
          count: day.contributionCount,
          level: LEVEL_MAP[day.contributionLevel] ?? (day.contributionCount > 0 ? 2 : 0),
        });
      }
    }

    return days;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch contribution calendar using public proxy API
 */
async function fetchViaPublicAPI(username) {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
    if (!res.ok) {
      console.warn(`[PublicAPI] Response status: ${res.status}`);
      return null;
    }
    const json = await res.json();
    const days = json?.contributions ?? [];
    if (!days.length) return null;

    const start = days.findIndex((d) => new Date(`${d.date}T00:00:00Z`).getUTCDay() === 0);
    return days.slice(start < 0 ? 0 : start).map((d) => ({
      date: d.date,
      count: d.count,
      level: Math.min(4, Math.max(0, d.level)),
    }));
  } catch (err) {
    console.warn(`[PublicAPI] Error: ${err.message}`);
    return null;
  }
}

/**
 * Fetch top repositories (from public events or public repo list)
 */
async function fetchRepos(username) {
  const headers = { "User-Agent": "shuo-blog-contributions-sync" };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }

  // 1. Try public push events
  try {
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
      headers,
    });
    if (eventsRes.ok) {
      const events = await eventsRes.json();
      if (Array.isArray(events) && events.length > 0) {
        const counts = new Map();
        for (const event of events) {
          if (event.type !== "PushEvent" || !event.repo) continue;
          const commits = event.payload?.commits?.length ?? 1;
          counts.set(event.repo.name, (counts.get(event.repo.name) ?? 0) + commits);
        }
        if (counts.size > 0) {
          return [...counts.entries()]
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([fullName, count]) => {
              const [owner, name] = fullName.split("/");
              return {
                name,
                count,
                href: `https://github.com/${fullName}`,
              };
            });
        }
      }
    }
  } catch (_) {}

  // 2. Try public repos list
  try {
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`, {
      headers,
    });
    if (reposRes.ok) {
      const userRepos = await reposRes.json();
      if (Array.isArray(userRepos) && userRepos.length > 0) {
        return userRepos.slice(0, 3).map((r) => ({
          name: r.name,
          count: r.stargazers_count ? `${r.stargazers_count} ★` : 1,
          href: r.html_url,
        }));
      }
    }
  } catch (_) {}

  return [
    { name: "shuo-blog", count: 1, href: `https://github.com/${username}/shuo-blog` },
  ];
}

async function main() {
  console.log(`\n🚀 Synchronizing GitHub contributions for: ${TARGET_USERS.join(", ")}`);
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  const result = {
    updatedAt: new Date().toISOString(),
    users: {},
  };

  for (const user of TARGET_USERS) {
    console.log(`\n📦 Fetching real live data for @${user}...`);
    let contributions = await fetchViaGraphQL(user);
    if (contributions && contributions.length > 0) {
      console.log(`  ✓ Retrieved ${contributions.length} days via GitHub GraphQL`);
    } else {
      contributions = await fetchViaPublicAPI(user);
      if (contributions && contributions.length > 0) {
        console.log(`  ✓ Retrieved ${contributions.length} days via Public API`);
      } else {
        console.log(`  ⚠ Could not fetch remote data for @${user}`);
      }
    }

    const repos = await fetchRepos(user);
    console.log(`  ✓ Retrieved ${repos.length} top active repositories for @${user}`);

    result.users[user.toLowerCase()] = {
      username: user,
      totalContributions: contributions?.reduce((sum, d) => sum + d.count, 0) || 0,
      contributions: contributions || [],
      repos: repos || [],
    };
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2), "utf-8");
  console.log(`\n✨ Successfully written static contribution snapshot to: ${OUTPUT_FILE}\n`);
}

main().catch((err) => {
  console.error("Fatal error during sync:", err);
  process.exit(1);
});
