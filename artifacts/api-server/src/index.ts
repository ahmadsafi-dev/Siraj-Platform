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

// --- Serve Frontend Static Files ---
// Hardcoded to the exact Vite output path shown in the Render build logs
const frontendPath = path.join(process.cwd(), "artifacts/jordan-volunteer/dist/public");

console.log("--- STARTUP DIAGNOSTICS ---");
console.log("Target Frontend Path:", frontendPath);
console.log("Did we find index.html?", fs.existsSync(path.join(frontendPath, "index.html")));
console.log("---------------------------");

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