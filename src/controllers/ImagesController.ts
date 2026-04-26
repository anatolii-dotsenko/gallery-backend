import { Request, Response } from "express";
import { Controller, Get } from "../decorators/controller";
import { container } from "../container";
import type { IContentService } from "../services/IContentService";

@Controller("/api")
export class ImagesController {
  
  @Get("/list/fruits")
  getFruits(_req: Request, res: Response) {
    // Отримуємо сервіс через існуючий DI-контейнер
    const service = container.resolve<IContentService>("fruits");
    res.json({ items: service.getList(), type: "fruits" });
  }

  @Get("/list/animals")
  getAnimals(_req: Request, res: Response) {
    const service = container.resolve<IContentService>("animals");
    res.json({ items: service.getList(), type: "animals" });
  }
  
}