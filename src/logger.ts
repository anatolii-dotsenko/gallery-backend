import fs from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "server.log");

export function log(message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(logFile, line + "\n");
}