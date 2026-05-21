import { Request, Response } from "express";
import mongoose from "mongoose";
import fs from "fs";
import multer from "multer";
import {
  Controller,
  Get,
  Post,
  Delete,
  UseMiddleware,
} from "../decorators/controller";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getBucket, uploadImage, listImages } from "../db-gridfs";
import { UserService } from "../services/UserService";

const upload = multer({ dest: "tmp/" });

@Controller("/api/images")
export class ImagesController {
  // Отримання списку (ТІЛЬКИ СВОЇХ фото)
  @Get("/")
  @UseMiddleware(authMiddleware)
  async getImages(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) return;
      const files = await listImages(req.userId);
      res.json(
        files.map((f: any) => ({
          id: f._id,
          name: f.filename,
          size: f.length,
        })),
      );
    } catch (error) {
      res.status(500).json({ error: "Помилка отримання списку з БД" });
    }
  }

  // Завантаження фото
  @Post("/")
  @UseMiddleware(authMiddleware)
  @UseMiddleware(upload.single("image"))
  async upload(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file || !req.userId) {
      res.status(400).json({ error: "Файл не надано або помилка авторизації" });
      return;
    }

    try {
      const fileSize = req.file.size;

      // Перевірка ліміту
      const canUpload = await UserService.checkStorageLimit(
        req.userId,
        fileSize,
      );
      if (!canUpload) {
        fs.unlinkSync(req.file.path); // Видаляємо тимчасовий файл
        res.status(413).json({ error: "Перевищено ліміт сховища (500MB)" });
        return;
      }

      await uploadImage(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        req.userId,
      );
      await UserService.updateStorageUsed(req.userId, fileSize); // Оновлюємо квоту

      fs.unlinkSync(req.file.path);
      res.json({ message: "Завантажено в GridFS" });
    } catch (error) {
      res.status(500).json({ error: "Помилка завантаження в БД" });
    }
  }

  // Видалення (ТІЛЬКИ СВОГО фото)
  @Delete("/:id")
  @UseMiddleware(authMiddleware)
  async deleteImg(req: AuthRequest, res: Response): Promise<void> {
    try {
      const fileId = new mongoose.mongo.ObjectId(req.params.id);
      const bucket = getBucket();
      const file = await bucket.find({ _id: fileId }).toArray();

      // Перевірка власності
      if (!file[0] || file[0].metadata?.userId !== req.userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      await bucket.delete(fileId);

      // Повертаємо місце користувачеві
      if (file[0].length) {
        await UserService.updateStorageUsed(req.userId, -file[0].length);
      }

      res.json({ success: true, message: "Видалено з GridFS" });
    } catch (error) {
      res.status(500).json({ error: "Помилка видалення з БД" });
    }
  }

  // Публічний маршрут для відображення самої картинки (<img>)
  @Get("/:id")
  async download(req: Request<{ id: string }>, res: Response) {
    try {
      const bucket = getBucket();
      bucket
        .openDownloadStream(new mongoose.mongo.ObjectId(req.params.id))
        .pipe(res);
    } catch (error) {
      res.status(404).json({ error: "Зображення не знайдено" });
    }
  }
}
