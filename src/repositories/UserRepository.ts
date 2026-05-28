import { injectable } from "tsyringe";
import { User, IUser } from "../models/User";
import { IUserRepository } from "./IUserRepository";

/**
 * Репозиторій для роботи з колекцією користувачів у MongoDB.
 */
@injectable()
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const newUser = new User(userData);
    return newUser.save();
  }
}
