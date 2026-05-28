import { Response } from "express";
import mongoose from "mongoose";
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseMiddleware,
} from "../decorators/controller";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { Album } from "../models/Album";
import { getBucket } from "../db-gridfs";

@Controller("/api/albums")
export class AlbumsController {
  @Get("/")
  @UseMiddleware(authMiddleware)
  async getAlbums(req: AuthRequest, res: Response): Promise<void> {
    try {
      const albums = await Album.find({ userId: req.userId }).sort({
        updatedAt: -1,
      });

      const albumsWithCounts = albums.map((album) => ({
        id: album._id,
        name: album.name,
        description: album.description,
        coverImageId: album.coverImageId,
        imageCount: album.imageIds.length,
        isPublic: album.isPublic,
        createdAt: album.createdAt,
      }));
      res.json(albumsWithCounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch albums" });
    }
  }

  @Get("/:id")
  @UseMiddleware(authMiddleware)
  async getAlbumById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const album = await Album.findOne({
        _id: req.params.id,
        userId: req.userId,
      });
      if (!album) {
        res.status(404).json({ error: "Album not found" });
        return;
      }

      const bucket = getBucket();
      const images = await bucket
        .find({ _id: { $in: album.imageIds } })
        .toArray();

      res.json({
        id: album._id,
        name: album.name,
        description: album.description,
        coverImageId: album.coverImageId,
        images: images.map((img) => ({
          id: img._id,
          name: img.filename,
          size: img.length,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch album" });
    }
  }

  @Post("/")
  @UseMiddleware(authMiddleware)
  async createAlbum(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name || name.trim().length === 0) {
        res.status(400).json({ error: "Album name is required" });
        return;
      }

      const newAlbum = new Album({
        name: name.trim(),
        description: description?.trim(),
        userId: req.userId,
      });
      await newAlbum.save();

      res
        .status(201)
        .json({ id: newAlbum._id, name: newAlbum.name, imageCount: 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to create album" });
    }
  }

  @Patch("/:id")
  @UseMiddleware(authMiddleware)
  async updateAlbum(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, coverImageId } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name.trim();
      if (description !== undefined)
        updateData.description = description?.trim();
      if (coverImageId) updateData.coverImageId = coverImageId;

      const album = await Album.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { $set: updateData },
        { new: true },
      );

      if (!album) {
        res.status(404).json({ error: "Album not found" });
        return;
      }

      res.json({ success: true, album });
    } catch (error) {
      res.status(500).json({ error: "Failed to update album" });
    }
  }

  @Delete("/:id")
  @UseMiddleware(authMiddleware)
  async deleteAlbum(req: AuthRequest, res: Response): Promise<void> {
    try {
      const album = await Album.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });
      if (!album) {
        res.status(404).json({ error: "Album not found" });
        return;
      }
      res.json({ success: true, message: "Album deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete album" });
    }
  }
}
