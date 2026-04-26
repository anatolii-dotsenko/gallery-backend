import fs from "fs";
import path from "path";

export class FileService {
  private imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  listImages(dirPath?: string): string[] {
    const files = fs.readdirSync(dirPath || ".");
    return files.filter((file) =>
      this.imageExtensions.includes(path.extname(file).toLowerCase())
    );
  }
}
