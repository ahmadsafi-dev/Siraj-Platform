import path from "path";
import express from "express";
import app from "./app";
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
// Point Express to your compiled Vite React app
const frontendPath = path.join(process.cwd(), "artifacts/jordan-volunteer/dist");
app.use(express.static(frontendPath));

// --- React Router Catch-All ---
// If a user navigates to a non-API route, send them the React index.html
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