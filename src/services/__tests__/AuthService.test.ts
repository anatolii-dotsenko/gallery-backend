import "reflect-metadata";
import { AuthService } from "../AuthService";
import { IUserRepository } from "../../repositories/IUserRepository";
import bcrypt from "bcrypt";

// 1. Створюємо Mock для репозиторію
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

describe("AuthService Unit Tests", () => {
  let authService: AuthService;

  beforeEach(() => {
    // Очищаємо моки перед кожним тестом
    jest.clearAllMocks();
    // 2. Ін'єктуємо мок у сервіс
    authService = new AuthService(mockUserRepository);
  });

  it("повинен викидати помилку, якщо користувач вже існує (signup)", async () => {
    // Налаштовуємо мок: база даних "повертає" користувача
    mockUserRepository.findByEmail.mockResolvedValueOnce({
      _id: "123",
      email: "test@test.com",
    } as any);

    await expect(
      authService.signup({
        email: "test@test.com",
        username: "test",
        password: "123",
      }),
    ).rejects.toThrow("User already exists");

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "test@test.com",
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it("повинен успішно реєструвати нового користувача", async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockUserRepository.create.mockResolvedValueOnce({
      _id: "new_id",
      email: "new@test.com",
      username: "newuser",
      storageUsed: 0,
      storageLimit: 100,
    } as any);

    const result = await authService.signup({
      email: "new@test.com",
      username: "newuser",
      password: "password123",
    });

    expect(result).toHaveProperty("token");
    expect(result.user.email).toBe("new@test.com");
    expect(mockUserRepository.create).toHaveBeenCalled();
  });
});
