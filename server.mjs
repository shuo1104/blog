import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(__dirname, "dist");
const DATA_FILE = path.resolve(__dirname, "data/engagement.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
};

function readEngagement() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (_) {}
  return {};
}

function writeEngagement(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (_) {}
}

const server = http.createServer((req, res) => {
  // 1. Handle API Engagement Endpoints
  if (req.url && req.url.startsWith("/api/engagement")) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "GET") {
      const data = readEngagement();
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const payload = body ? JSON.parse(body) : {};
          const { slug, delta = 1 } = payload;
          if (!slug) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Missing slug" }));
            return;
          }

          const data = readEngagement();
          if (!data[slug]) {
            data[slug] = { likes: 0, shares: 0, views: 0 };
          }

          if (req.url === "/api/engagement/like") {
            data[slug].likes = Math.max(0, (data[slug].likes || 0) + Number(delta));
          } else if (req.url === "/api/engagement/share") {
            data[slug].shares = (data[slug].shares || 0) + 1;
          } else if (req.url === "/api/engagement/view") {
            data[slug].views = (data[slug].views || 0) + 1;
          }

          writeEngagement(data);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, stats: data[slug] }));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  // 2. Handle Static Files from dist/
  let reqPath = req.url ? req.url.split("?")[0] : "/";
  if (reqPath === "/") reqPath = "/index.html";

  let filePath = path.join(DIST_DIR, reqPath);

  // If path doesn't exist, fallback to index.html (SPA routing)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, "index.html");
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    res.setHeader("Content-Type", mime);

    // Cache static assets with hash for 1 year
    if (reqPath.startsWith("/assets/")) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      res.setHeader("Cache-Control", "no-cache");
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Shuo Blog Production Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${DIST_DIR}`);
  console.log(`💾 Real-time Engagement DB at: ${DATA_FILE}\n`);
});
