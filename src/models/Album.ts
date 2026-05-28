import mongoose, { Schema, Document } from "mongoose";

export interface IAlbum extends Document {
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  coverImageId?: mongoose.Types.ObjectId;
  imageIds: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema = new Schema<IAlbum>(
  {
    name: { type: String, required: true },
    description: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coverImageId: { type: Schema.Types.ObjectId },
    imageIds: [{ type: Schema.Types.ObjectId }],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
); // Mongoose сам буде оновлювати createdAt та updatedAt

export const Album = mongoose.model<IAlbum>("Album", AlbumSchema);
