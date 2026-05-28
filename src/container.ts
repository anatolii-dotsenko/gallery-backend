import "reflect-metadata";
import { container } from "tsyringe";
import { FileService } from "./services/FileService";
import { UserRepository } from "./repositories/UserRepository";

// Реєстрація сервісів
container.register("IFileService", { useClass: FileService });

// Реєстрація репозиторіїв (прив'язка інтерфейсу до реалізації)
container.register("IUserRepository", { useClass: UserRepository });

export { container };
