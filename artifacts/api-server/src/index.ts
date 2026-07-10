import path from "path";
import express from "express";
import app from "./app";
import fs from "fs";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// --- Serve Frontend Static Files (Smart Auto-Detect) ---
const frontendBase = path.join(process.cwd(), "artifacts/jordan-volunteer");
let frontendPath = path.join(frontendBase, "dist"); // Standard Vite output

// If index.html isn't in 'dist', check 'public' (our Vercel fix) and 'build' (CRA)
if (!fs.existsSync(path.join(frontendPath, "index.html"))) {
    frontendPath = path.join(frontendBase, "public");
}
if (!fs.existsSync(path.join(frontendPath, "index.html"))) {
    frontendPath = path.join(frontendBase, "build");
}

app.use(express.static(frontendPath));

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});