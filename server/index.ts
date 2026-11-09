import mongoose from "mongoose";
import { config } from "./config.js";
import app from "./app.js";

async function start() {
  await mongoose.connect(config.MONGODB_URI);
  app.listen(config.PORT, () => {
    console.info(`DevQueens API listening on port ${config.PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start DevQueens API:", error);
  process.exitCode = 1;
});
