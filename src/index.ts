import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { log } from "./logger.js";

const app = express();
const PORT = 3000;
const IMAGES_DIR = path.join(process.cwd(), "images");

// Логування кожного запиту
app.use((req: Request, _res: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`);
  next();
});

// Список доступних зображень
app.get("/images", (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(IMAGES_DIR).filter((f) =>
      [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(
        path.extname(f).toLowerCase()
      )
    );
    res.json({ images: files });
  } catch {
    res.status(500).json({ error: "Не вдалося прочитати папку зображень" });
  }
});

// Отримання конкретного зображення
app.get("/images/:filename", (req: Request<{ filename: string }>, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(IMAGES_DIR, filename);

  // Захист від path traversal
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
    ".jpg": "image/jpg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(filePath);
  const blob = Buffer.from(buffer);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", blob.length);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(blob);
});

// Обробка невідомих шляхів
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Маршрут не знайдено" });
});

// Глобальна обробка помилок
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log(`ERROR: ${err.message}`);
  res.status(500).json({ error: "Внутрішня помилка сервера" });
});

app.listen(PORT, () => {
  log(`Сервер запущено на http://localhost:${PORT}`);
});