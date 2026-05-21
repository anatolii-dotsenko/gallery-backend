import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Controller, Post, Get, UseMiddleware } from "../decorators/controller";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import { authMiddleware, AuthRequest } from "../middleware/auth";

@Controller("/api/auth")
export class AuthController {
  @Post("/signup")
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;
      if (!email || !username || !password) {
        res.status(400).json({ error: "All fields required" });
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({ email, username, passwordHash });
      await newUser.save();

      const token = generateToken({ userId: newUser._id.toString(), email });
      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          email,
          username,
          storageUsed: newUser.storageUsed,
          storageLimit: newUser.storageLimit,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  @Post("/login")
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password required" });
        return;
      }

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
      });
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          storageUsed: user.storageUsed,
          storageLimit: user.storageLimit,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  @Get("/me")
  @UseMiddleware(authMiddleware)
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        id: user._id,
        email: user.email,
        username: user.username,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
}
