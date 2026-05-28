import { injectable, inject } from "tsyringe";
import bcrypt from "bcrypt";
import { IUserRepository } from "../repositories/IUserRepository";
import { generateToken } from "../utils/jwt";

// визначаємо структуру відповіді
export interface AuthResponse {
  token?: string; // Робимо опціональним, бо для /me токен не повертається
  user: {
    id: unknown;
    email: string;
    username: string;
    storageUsed: number;
    storageLimit: number;
    avatarUrl?: string;
  };
}

@injectable()
export class AuthService {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository,
  ) {}

  async signup(data: any): Promise<AuthResponse> {
    const { email, username, password } = data;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.create({
      email,
      username,
      passwordHash,
    });

    const token = generateToken({ userId: newUser._id.toString(), email });

    return {
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        storageUsed: newUser.storageUsed,
        storageLimit: newUser.storageLimit,
      },
    };
  }

  async login(data: any): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
      },
    };
  }

  async getCurrentUser(userId: string): Promise<AuthResponse["user"]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id,
      email: user.email,
      username: user.username,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit,
      avatarUrl: user.avatarUrl,
    };
  }
}
