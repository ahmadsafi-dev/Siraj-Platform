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

//app.listen(port, (err) => {
  //if (err) {
    //logger.error({ err }, "Error listening on port");
    //process.exit(1);
  //}

  //logger.info({ port }, "Server listening");
//});

// Remove or comment out your standard app.listen block, and replace it with this:

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;