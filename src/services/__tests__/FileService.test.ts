import "reflect-metadata";
import { FileService } from "../FileService";
import fs from "fs";

// Мокаємо модуль fs
jest.mock("fs");

describe("FileService Unit Tests", () => {
  let fileService: FileService;

  beforeEach(() => {
    // Очищаємо історію викликів моків перед кожним тестом,
    // щоб тести не впливали один на одного
    jest.clearAllMocks();
    fileService = new FileService();
  });

  describe("listImages", () => {
    it("повинен повертати порожній масив, якщо папка не існує", () => {
      // Імітуємо відсутність папки
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = fileService.listImages("uploads");

      expect(result).toEqual([]);
      expect(fs.existsSync).toHaveBeenCalled();
      // Перевіряємо, що ми не намагалися читати неіснуючу папку
      expect(fs.readdirSync).not.toHaveBeenCalled();
    });

    it("повинен фільтрувати і повертати лише файли зображень (включаючи різний регістр)", () => {
      // Імітуємо наявність папки
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Імітуємо мікс файлів, включаючи розширення у верхньому регістрі
      (fs.readdirSync as jest.Mock).mockReturnValue([
        "photo.jpg",
        "document.pdf",
        "family.png",
        "archive.zip",
        "meme.GIF",
      ]);

      const result = fileService.listImages("uploads");

      // Перевіряємо, чи залишились тільки картинки
      expect(result).toEqual(["photo.jpg", "family.png", "meme.GIF"]);
    });
  });

  describe("readImage", () => {
    it("повинен зчитувати файл та повертати Buffer", () => {
      // Створюємо фейковий буфер для імітації бінарних даних картинки
      const mockBuffer = Buffer.from("fake-image-data");
      (fs.readFileSync as jest.Mock).mockReturnValue(mockBuffer);

      const result = fileService.readImage("uploads", "photo.jpg");

      expect(result).toBe(mockBuffer);
      // Перевіряємо, чи викликався метод читання файлу
      expect(fs.readFileSync).toHaveBeenCalled();
    });
  });
});
