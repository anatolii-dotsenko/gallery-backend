import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { Controller, Post, Get, UseMiddleware } from "../decorators/controller";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AuthService } from "../services/AuthService";
import { logger } from "../logger";

@Controller("/api/auth")
@injectable()
export class AuthController {
  constructor(@inject(AuthService) private authService: AuthService) {}
  @Post("/signup")
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;
      if (!email || !username || !password) {
        res.status(400).json({ error: "All fields required" });
        return;
      }

      const result = await this.authService.signup(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      logger.error(`Signup error: ${error.message}`);
      if (error.message === "User already exists") {
        res.status(400).json({ error: error.message });
        return;
      }
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

      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (error: any) {
      logger.error(`Login error: ${error.message}`);
      if (error.message === "Invalid credentials") {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Server error" });
    }
  }

  @Get("/me")
  @UseMiddleware(authMiddleware)
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await this.authService.getCurrentUser(req.userId);
      res.json(user);
    } catch (error: any) {
      logger.error(`Me error: ${error.message}`);
      if (error.message === "User not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Server error" });
    }
  }
}
