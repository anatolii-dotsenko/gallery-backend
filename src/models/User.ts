import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  avatarUrl?: string;
  storageUsed: number;
  storageLimit: number;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  avatarUrl: { type: String },
  storageUsed: { type: Number, default: 0 },
  storageLimit: { type: Number, default: 524288000 }, // 500MB
});

export const User = mongoose.model<IUser>("User", UserSchema);
