import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { log } from "./logger.js";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
const PORT = 3000;
const IMAGES_DIR = path.join(process.cwd(), "images");

app.use((req: Request, _res: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`);
  next();
});

// Ендпоінт: список елементів (два варіанти)
app.get("/api/list/:type", (req: Request<{ type: string }>, res: Response) => {
  const lists: Record<string, string[]> = {
    fruits: ["Яблуко", "Банан", "Манго", "Ківі", "Апельсин"],
    animals: ["Кіт", "Пес", "Лисиця", "Ведмідь", "Заєць"],
  };
  const data = lists[req.params.type] || lists.fruits;
  res.json({ items: data, type: req.params.type });
});

// Отримання конкретного зображення за типом
app.get("/api/list/:type/images/:filename", (req: Request<{ type: string; filename: string }>, res: Response) => {
  const { type, filename } = req.params;
  const filePath = path.join(IMAGES_DIR, type, filename);

  if (!filePath.startsWith(IMAGES_DIR)) {
    res.status(400).json({ error: "Неприпустимий шлях" });
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Зображення не знайдено" });
    return;
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(filePath);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", buffer.length);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(buffer);
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Маршрут не знайдено" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log(`ERROR: ${err.message}`);
  res.status(500).json({ error: "Внутрішня помилка сервера" });
});

app.listen(PORT, () => {
  log(`Сервер запущено на http://localhost:${PORT}`);
});
