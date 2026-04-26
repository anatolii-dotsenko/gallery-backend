import { injectable } from "tsyringe";
import fs from "fs";
import path from "path";
import type { IFileService } from "./IFileService";

@injectable()
export class FileService implements IFileService {
  private baseDir = path.join(process.cwd(), "images");
  private imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  readImage(type: string, filename: string): Buffer {
    return fs.readFileSync(path.join(this.baseDir, type, filename));
  }

  listImages(type: string): string[] {
    const typeDir = path.join(this.baseDir, type);
    if (!fs.existsSync(typeDir)) return [];
    
    const files = fs.readdirSync(typeDir);
    return files.filter((file) =>
      this.imageExtensions.includes(path.extname(file).toLowerCase())
    );
  }
}