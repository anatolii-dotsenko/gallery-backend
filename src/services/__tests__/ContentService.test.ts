import "reflect-metadata";
import { FruitsService } from "../FruitsService";
import { AnimalsService } from "../AnimalsService";

describe("FruitsService", () => {
  it("повертає непустий список фруктів", () => {
    const service = new FruitsService();
    const list = service.getList();
    expect(list.length).toBeGreaterThan(0);
    expect(list).toContain("Яблуко");
  });
});

describe("AnimalsService", () => {
  it("повертає список тварин", () => {
    const service = new AnimalsService();
    const list = service.getList();
    expect(list.length).toBeGreaterThan(0);
  });
});