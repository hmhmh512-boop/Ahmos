import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import YTDlpWrapPkg from "yt-dlp-wrap";
const YTDlpWrap = (YTDlpWrapPkg as any).default || YTDlpWrapPkg;
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const ytDlpPath = path.join(process.cwd(), "yt-dlp.exe"); // On linux it's just yt-dlp
  const isWindows = process.platform === "win32";
  const binaryName = isWindows ? "yt-dlp.exe" : "yt-dlp";
  const binaryPath = path.join(process.cwd(), binaryName);

  const ytDlpWrap = new YTDlpWrap(binaryPath);

  // Download binary if not exists
  if (!fs.existsSync(binaryPath)) {
    console.log("Downloading yt-dlp binary...");
    try {
      await YTDlpWrap.downloadFromGithub(binaryPath);
      if (!isWindows) {
        fs.chmodSync(binaryPath, 0o755);
      }
      console.log("yt-dlp binary downloaded successfully.");
    } catch (err) {
      console.error("Failed to download yt-dlp binary:", err);
    }
  }

  // Status endpoint
  app.get("/api/status", (req, res) => {
    res.json({ 
      ready: fs.existsSync(binaryPath),
      platform: process.platform,
      binaryPath
    });
  });

  // API Routes
  app.post("/api/info", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const metadata = await ytDlpWrap.getVideoInfo(url);
      res.json(metadata);
    } catch (error) {
      console.error("Error fetching video info:", error);
      res.status(500).json({ error: "Failed to fetch video information. Make sure the link is valid." });
    }
  });

  app.get("/api/download", async (req, res) => {
    const url = req.query.url as string;
    const quality = req.query.quality as string || "best";
    const type = req.query.type as string || "video"; // "video" or "audio"

    if (!url) {
      return res.status(400).send("URL is required");
    }

    try {
      console.log(`Starting download for: ${url} | Quality: ${quality} | Type: ${type}`);
      
      const metadata = await ytDlpWrap.getVideoInfo(url);
      const baseFilename = (metadata.title || "video").replace(/[\\/:*?"<>|]/g, "_");
      const ext = type === "audio" ? "mp3" : "mp4";
      const filename = `${baseFilename}.${ext}`;

      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Type", type === "audio" ? "audio/mpeg" : "video/mp4");

      const args = [url];

      if (type === "audio") {
        args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
      } else {
        // Map quality strings to yt-dlp format selectors
        let formatSelector = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
        if (quality === "1080") {
          formatSelector = "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best";
        } else if (quality === "720") {
          formatSelector = "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best";
        } else if (quality === "480") {
          formatSelector = "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best";
        }
        args.push("-f", formatSelector, "--merge-output-format", "mp4");
      }

      args.push("--no-playlist");

      const ytDlpProcess = ytDlpWrap.execStream(args);

      ytDlpProcess.pipe(res);

      ytDlpProcess.on("error", (err) => {
        console.error("yt-dlp stream error:", err);
        if (!res.headersSent) {
          res.status(500).send("Operation failed");
        }
      });

    } catch (error) {
      console.error("Error starting operation:", error);
      if (!res.headersSent) {
        res.status(500).send("Could not initiate operation");
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
