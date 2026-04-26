import "reflect-metadata";
import { FileService } from "../FileService";
import fs from "fs";

jest.mock("fs");

describe("FileService", () => {
  it("listImages фільтрує лише зображення", () => {
    (fs.readdirSync as jest.Mock).mockReturnValue([
      "photo.jpg",
      "document.pdf",
      "image.png",
      "readme.txt",
    ]);

    const service = new FileService();
    const result = service.listImages("fruits");
    expect(result).toEqual(["photo.jpg", "image.png"]);
  });
});
