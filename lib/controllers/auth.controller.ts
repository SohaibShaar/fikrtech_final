import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AdminService } from "../services/admin.service";
import { registerSchema, loginSchema } from "../validation/auth";
import { ApiResponse, AuthenticatedRequest } from "../types";

export class AuthController {
  /**
   * Register a new user
   */
  static async register(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      // Validate request body
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await AuthService.register(value);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Register controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await AuthService.login(value.email, value.password);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error("Login controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await AuthService.getProfile(req.user.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Get profile controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Create admin user (for initial setup)
   */
  static async createAdmin(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const result = await AuthService.createAdmin(email, password);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Create admin controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  static async logout(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      // Since we're using stateless JWT tokens, logout is handled client-side
      // This endpoint is mainly for consistency and future token blacklisting if needed
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get tutoring categories without authentication
   */
  static async getTutoringCategories(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const result = await AdminService.getTutoringCategories();
      // Return 200 even if no categories found (empty array)
      res.status(200).json({
        success: true,
        message: result.message || "Tutoring categories retrieved successfully",
        data: result.data || [],
      });
    } catch (error) {
      console.error("Get tutoring categories controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: [],
      });
    }
  }

  /**
   * Get tutoring subcategories for a specific parent category
   */
  static async getTutoringSubcategories(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { parentId } = req.params;
      const result = await AdminService.getTutoringSubcategories(parentId);
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error("Get tutoring subcategories controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: [],
      });
    }
  }
}
