import "reflect-metadata";
import { container } from "tsyringe";
import { FileService } from "./services/FileService";
import { FruitsService } from "./services/FruitsService";
import { AnimalsService } from "./services/AnimalsService";

container.register("IFileService", { useClass: FileService });
container.register("fruits", { useClass: FruitsService });
container.register("animals", { useClass: AnimalsService });

export { container };