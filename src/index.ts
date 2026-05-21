import "reflect-metadata"; // ОБОВ'ЯЗКОВО ПЕРШИМ імпортом
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import cors from "cors";

// Локальні імпорти
import { log } from "./logger.js";
import { connectDB } from "./db-gridfs";

// --- Імпорти для MVC Контролерів (реєструються автоматично завдяки декораторам) ---
import "./controllers/ImagesController";
import "./controllers/AuthController"; // Просто імпортуємо файл, декоратори зроблять свою справу!
import { getRouters } from "./decorators/controller";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Беремо порт з .env або використовуємо 3000 за замовчуванням
const PORT = process.env.PORT || 3000;
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

// --- Реєстрація MVC маршрутів ---
// Ця магія автоматично підтягує всі роути з AuthController та ImagesController
getRouters().forEach((router, prefix) => {
  app.use(prefix, router);
});

// Статичні файли (якщо залишились якісь базові картинки на диску)
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
