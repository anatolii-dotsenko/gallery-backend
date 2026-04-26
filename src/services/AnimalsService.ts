import { injectable } from "tsyringe";
import type { IContentService } from "./IContentService";

@injectable()
export class AnimalsService implements IContentService {
  getList() { 
    return ["Кіт", "Пес", "Лисиця", "Ведмідь", "Заєць"]; 
  }
}