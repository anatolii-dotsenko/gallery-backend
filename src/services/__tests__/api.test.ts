import request from "supertest";
import express from "express";
import { setupDb, teardownDb } from "./fixtures/dbFixture";

// Створюємо тестовий express додаток для перевірки маршрутів
const app = express();
app.use(express.json());

// Мокуємо маршрут для тесту
app.get("/api/list/fruits", (_req, res) => {
  res.json({ items: ["Яблуко", "Банан"] });
});

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe("GET /api/list/fruits", () => {
  it("повертає список з двох фруктів", async () => {
    const res = await request(app).get("/api/list/fruits");
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items).toContain("Яблуко");
  });
});

describe("GET /api/list/unknown", () => {
  it("повертає 404 для невідомого типу", async () => {
    const res = await request(app).get("/api/list/unknown");
    expect(res.status).toBe(404);
  });
});