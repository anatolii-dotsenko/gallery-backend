import { User } from "../models/User";

export class UserService {
  static async updateStorageUsed(userId: string, bytesAdded: number) {
    await User.findByIdAndUpdate(userId, { $inc: { storageUsed: bytesAdded } });
  }

  static async checkStorageLimit(
    userId: string,
    fileSize: number,
  ): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;
    return user.storageUsed + fileSize <= user.storageLimit;
  }
}
