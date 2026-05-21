import "reflect-metadata"; // ОБОВ'ЯЗКОВО ПЕРШИМ імпортом
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import mongoose from "mongoose";
// Локальні імпорти
import { log } from "./logger.js";
import { container } from "./container";
import {
  connectDB,
  getBucket,
  uploadImage,
  listImages,
  deleteImage,
} from "./db-gridfs";
import type { IContentService } from "./services/IContentService";
import type { IFileService } from "./services/IFileService";
// --- Імпорти для MVC Контролерів ---
import "./controllers/ImagesController";
import { getRouters } from "./decorators/controller";
import { AuthController } from "./controllers/AuthController";

// Налаштування Multer для тимчасового зберігання файлів
const upload = multer({ dest: "tmp/" });

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const PORT = 3000;
const IMAGES_DIR = path.join(process.cwd(), "images");

// Підключення до MongoDB
connectDB().catch((err: any) =>
  console.error("Помилка підключення до MongoDB:", err),
);
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let sliderValue = 50;

// Middleware для логування
app.use((req: Request, _res: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`);
  next();
});

// --- Маршрути для MongoDB GridFS ---

// 1. Завантаження зображення в БД
app.post(
  "/api/images",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "Файл не надано" });
      return;
    }
    try {
      await uploadImage(req.file.path, req.file.originalname);
      fs.unlinkSync(req.file.path); // Видаляємо тимчасовий файл після завантаження в БД
      res.json({ message: "Завантажено в GridFS" });
    } catch (error) {
      res.status(500).json({ error: "Помилка завантаження в БД" });
    }
  },
);

// 2. Список зображень у GridFS
app.get("/api/images", async (_req: Request, res: Response) => {
  try {
    const files = await listImages();
    res.json(files.map((f: any) => ({ id: f._id, name: f.filename })));
  } catch (error) {
    res.status(500).json({ error: "Помилка отримання списку з БД" });
  }
});

// 3. Отримати конкретне зображення з GridFS за ID
// Додаємо <{ id: string }>, щоб виправити помилку "string | string[]"
app.get(
  "/api/images/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const bucket = getBucket();
      // Використовуємо mongoose.mongo.ObjectId
      bucket
        .openDownloadStream(new mongoose.mongo.ObjectId(req.params.id))
        .pipe(res);
    } catch (error) {
      res.status(404).json({ error: "Зображення в БД не знайдено" });
    }
  },
);

// 4. Видалити зображення з GridFS
app.delete(
  "/api/images/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      await deleteImage(req.params.id);
      res.json({ message: "Видалено з GridFS" });
    } catch (error) {
      res.status(500).json({ error: "Помилка видалення з БД" });
    }
  },
);

// --- Маршрути з використанням Dependency Injection (tsyringe) ---
// Отримання списку доступних статичних зображень (фрукти/тварини)
app.get(
  "/api/list/:type/images",
  (req: Request<{ type: string }>, res: Response) => {
    const { type } = req.params;
    try {
      const fileService = container.resolve<IFileService>("IFileService");
      const files = fileService.listImages(type);

      if (files.length === 0) {
        res
          .status(404)
          .json({ error: "Категорію зображень не знайдено або папка порожня" });
        return;
      }

      res.json({ images: files });
    } catch (error) {
      res.status(500).json({ error: "Не вдалося прочитати папку зображень" });
    }
  },
);
// Отримання текстового списку (фрукти або тварини) deprecated (mvc)
// app.get("/api/list/:type", (req: Request<{ type: string }>, res: Response) => {
//   const type = req.params.type as "fruits" | "animals";

//   try {
//     // Отримуємо сервіс динамічно з контейнера за ключем
//     const service = container.resolve<IContentService>(type);
//     res.json({ items: service.getList(), type });
//   } catch (error) {
//     res.status(404).json({ error: "Сервіс для цього типу не знайдено" });
//   }
// });
// --- Реєстрація MVC маршрутів ---
getRouters().forEach((router, prefix) => {
  app.use(prefix, router);
});

// Статичні файли (для папки images на диску)
app.use(
  "/images",
  express.static(IMAGES_DIR, {
    maxAge: 3600000,
  }),
);

// Обробка 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Маршрут не знайдено" });
});

// Глобальний обробник помилок
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log(`ERROR: ${err.message}`);
  res.status(500).json({ error: "Внутрішня помилка сервера" });
});

// --- Логіка Socket.IO ---
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
