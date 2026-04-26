import "reflect-metadata";
import { FileService } from "../FileService";
import fs from "fs";

// Мокаємо модуль fs
jest.mock("fs");

describe("FileService", () => {
  it("listImages фільтрує лише зображення", () => {
    // 1. Мокаємо existsSync, щоб сервіс думав, що папка існує
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    // 2. Мокаємо readdirSync, щоб він повернув мікс файлів
    (fs.readdirSync as jest.Mock).mockReturnValue([
      "photo.jpg", 
      "document.pdf", 
      "image.png", 
      "readme.txt"
    ]);

    const service = new FileService();
    
    // 3. Викликаємо метод, обов'язково передавши аргумент типу папки (наприклад, "fruits")
    const result = service.listImages("fruits");
    
    // 4. Перевіряємо, чи залишились тільки картинки
    expect(result).toEqual(["photo.jpg", "image.png"]);
  });
});