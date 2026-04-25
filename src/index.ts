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

const mimeTypes: { [key: string]: string } = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

// Отримання списку доступних зображень для певної категорії
app.get("/api/list/:type/images", (req: Request<{ type: string }>, res: Response) => {
  const { type } = req.params;
  const typeDir = path.join(IMAGES_DIR, type);

  if (!fs.existsSync(typeDir)) {
    res.status(404).json({ error: "Категорію зображень не знайдено" });
    return;
  }

  try {
    const files = fs.readdirSync(typeDir).filter((f) =>
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
app.get("/api/image/:type/:filename", (req: Request<{ type: string; filename: string }>, res: Response) => {
  const { type, filename } = req.params;
  const filePath = path.join(IMAGES_DIR, type, filename);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(filePath);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", buffer.length);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(buffer);
});

// Отримання текстового списку (фрукти або тварини)
app.get("/api/list/:type", (req: Request<{ type: string }>, res: Response) => {
  const lists: Record<string, string[]> = {
    fruits: ["Яблуко", "Банан", "Манго", "Ківі", "Апельсин"],
    animals: ["Кіт", "Пес", "Лисиця", "Ведмідь", "Заєць"],
  };
  
  const type = req.params.type;
  const data = lists[type];

  if (data) {
    res.json({ items: data, type });
  } else {
    res.status(404).json({ error: "Список не знайдено" });
  }
});

// Роздаємо статичні файли з папки images за префіксом /images
// maxAge встановлює заголовок Cache-Control (в мілісекундах)
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

app.listen(PORT, () => {
  log(`Сервер запущено на http://localhost:${PORT}`);
});
