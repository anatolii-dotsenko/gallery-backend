import "reflect-metadata"; // MUST BE THE FIRST IMPORT
import "dotenv/config";

// Initialize DI container before loading controllers!
import "./container";

import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import cors from "cors";

// Local imports
import { log } from "./logger"; // Winston logger is used here
import { connectDB } from "./db-gridfs";

// --- MVC Controllers imports ---
import "./controllers/ImagesController";
import "./controllers/AuthController";
import { getRouters } from "./decorators/controller";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Get port from .env or use 3000 as default
const PORT = process.env.PORT || 3000;
const IMAGES_DIR = path.join(process.cwd(), "images");

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let sliderValue = 50;

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`);
  next();
});

// --- MVC Routes Registration ---
// Automatically loads all routes from registered controllers
getRouters().forEach((router, prefix) => {
  app.use(prefix, router);
});

// Static files (for any remaining basic images on disk)
app.use(
  "/images",
  express.static(IMAGES_DIR, {
    maxAge: 3600000,
  }),
);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log(`ERROR: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

// --- Socket.IO Logic ---
io.on("connection", (socket) => {
  log(`Client connected: ${socket.id}`);
  socket.emit("slider:sync", sliderValue);

  socket.on("slider:change", (value: number) => {
    sliderValue = value;
    socket.broadcast.emit("slider:sync", value);
  });

  socket.on("disconnect", () => {
    log(`Client disconnected: ${socket.id}`);
  });
});

// ==========================================
// START SERVER & DATABASE
// Only if not in a testing environment
// ==========================================
if (process.env.NODE_ENV !== "test") {
  // Connect to MongoDB
  connectDB().catch((err: any) =>
    console.error("MongoDB connection error:", err),
  );

  // Start the HTTP server
  httpServer.listen(PORT, () => {
    log(`Server started on http://localhost:${PORT}`);
  });
}

// Export app for testing (Supertest)
export { app };
