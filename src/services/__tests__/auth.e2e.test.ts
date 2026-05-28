import "reflect-metadata";
import request from "supertest";
import { setupDb, teardownDb } from "./fixtures/dbFixture";

// Імпортуємо РЕАЛЬНИЙ додаток замість створення порожнього
import { app } from "../../index";
import { User } from "../../models/User";

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

beforeEach(async () => {
  // Очищаємо колекцію перед кожним тестом, щоб тести були незалежними
  await User.deleteMany({});
});

describe("Auth API Endpoints", () => {
  describe("POST /api/auth/signup", () => {
    it("повинен успішно зареєструвати користувача і повернути токен", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        email: "e2e@test.com",
        username: "e2e_user",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", "e2e@test.com");

      // Перевіряємо, чи юзер дійсно з'явився в БД
      const userInDb = await User.findOne({ email: "e2e@test.com" });
      expect(userInDb).not.toBeNull();
    });

    it("повинен повертати 400, якщо не передано всі поля", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        email: "e2e@test.com",
        // username відсутній
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("All fields required");
    });
  });
});
