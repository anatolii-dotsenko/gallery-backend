import "reflect-metadata";
import { container } from "tsyringe";
import { FileService } from "./services/FileService";

container.register("IFileService", { useClass: FileService });

export { container };
