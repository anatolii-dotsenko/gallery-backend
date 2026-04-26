import "reflect-metadata"; // Обов'язково ПЕРШИМ імпортом
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { log } from "./logger.js";
import cors from "cors";

// Імпортуємо контейнер та інтерфейси
import { container } from "./container";
import type { IFileService } from "./services/IFileService";
import type { IContentService } from "./services/IContentService";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
const PORT = 3000;
const IMAGES_DIR = path.join(process.cwd(), "images");

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let sliderValue = 50;

app.use((req: Request, _res: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`);
  next();
});

const mimeTypes: { [key: string]: string } = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

// 1. Отримання списку доступних зображень
app.get("/api/list/:type/images", (req: Request<{ type: string }>, res: Response) => {
  const { type } = req.params;
  const fileService = container.resolve<IFileService>("IFileService");
  
  try {
    const files = fileService.listImages(type);
    if (files.length === 0) {
      res.status(404).json({ error: "Категорію зображень не знайдено або папка порожня" });
      return;
    }
    res.json({ images: files });
  } catch {
    res.status(500).json({ error: "Не вдалося прочитати папку зображень" });
  }
});

// 2. Отримання конкретного зображення
app.get("/api/image/:type/:filename", (req: Request<{ type: string; filename: string }>, res: Response) => {
  const { type, filename } = req.params;
  const fileService = container.resolve<IFileService>("IFileService");

  try {
    const buffer = fileService.readImage(type, filename);
    const ext = path.extname(filename).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buffer);
  } catch (error) {
    res.status(404).json({ error: "Зображення не знайдено" });
  }
});

// 3. Отримання текстового списку (фрукти або тварини)
app.get("/api/list/:type", (req: Request<{ type: string }>, res: Response) => {
  const type = req.params.type as "fruits" | "animals";
  
  try {
    // Отримуємо відповідний сервіс динамічно по ключу ("fruits" або "animals")
    const service = container.resolve<IContentService>(type);
    res.json({ items: service.getList(), type });
  } catch (error) {
    res.status(404).json({ error: "Список не знайдено (немає зареєстрованого сервісу)" });
  }
});

app.use("/images", express.static(IMAGES_DIR, {
  maxAge: 3600000 
}));

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Маршрут не знайдено" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log(`ERROR: ${err.message}`);
  res.status(500).json({ error: "Внутрішня помилка сервера" });
});

// Обробка Socket.IO
io.on("connection", (socket) => {
  log(`Клієнт підключився: ${socket.id}`);
  socket.emit("slider:sync", sliderValue);

  socket.on("slider:change", (value: number) => {
    sliderValue = value;
    socket.broadcast.emit("slider:sync", value);
  });

  socket.on("disconnect", () => {
    log(`Клієнт від'єднався: ${socket.id}`);
  });
});

// Запуск сервера
httpServer.listen(PORT, () => {
  log(`Сервер запущено на http://localhost:${PORT}`);
});