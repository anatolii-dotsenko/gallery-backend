import { injectable } from "tsyringe";
import type { IContentService } from "./IContentService";

@injectable()
export class FruitsService implements IContentService {
  getList() { 
    return ["Яблуко", "Банан", "Манго", "Ківі", "Апельсин"]; 
  }
}