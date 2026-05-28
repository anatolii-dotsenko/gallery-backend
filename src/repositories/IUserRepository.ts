import { IUser } from "../models/User";

// Це дозволить відв'язати бізнес-логіку від конкретної ORM/ODM (Mongoose)
export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
}
