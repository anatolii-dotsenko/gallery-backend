import mongoose from "mongoose";
import fs from "fs";

export async function connectDB() {
  // Якщо в .env є рядок підключення — беремо його, інакше — дефолтний
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/lab28";
  await mongoose.connect(uri);
  console.log(`MongoDB підключено до: ${uri}`);
}

export function getBucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
    bucketName: "images",
  });
}

export async function uploadImage(filePath: string, filename: string) {
  const bucket = getBucket();
  const readStream = fs.createReadStream(filePath);
  const uploadStream = bucket.openUploadStream(filename);
  readStream.pipe(uploadStream);

  return new Promise((resolve, reject) => {
    uploadStream.on("finish", resolve);
    uploadStream.on("error", reject);
  });
}

export async function listImages() {
  const bucket = getBucket();
  return bucket.find({}).toArray();
}

export async function deleteImage(id: string) {
  const bucket = getBucket();
  await bucket.delete(new mongoose.mongo.ObjectId(id));
}
