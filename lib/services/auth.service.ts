import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import prisma from "../config/database";
import { generateToken } from "../config/jwt";
import { ApiResponse } from "../types";

export class AuthService {
  /**
   * Register a new user (Student or Teacher)
   */
  static async register(data: {
    email: string;
    password: string;
    role: UserRole;
    fullName: string;
    phone?: string;
  }): Promise<ApiResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists",
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user with profile
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            role: data.role,
          },
        });

        // Create role-specific profile
        if (data.role === UserRole.STUDENT) {
          await tx.student.create({
            data: {
              userId: user.id,
              fullName: data.fullName,
              gender: "OTHER",
              nationality: "Unknown",
              dateOfBirth: new Date("2005-01-01"),
              age: 18,
              phone: data.phone || "Not provided",
            },
          });
        }
        // Note: Teacher profile will be created during registration process

        return user;
      });

      // Generate token
      const token = generateToken({
        id: result.id,
        email: result.email,
        role: result.role,
      });

      return {
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: result.id,
            email: result.email,
            role: result.role,
          },
          token,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed",
        errors: error,
      };
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<ApiResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          student: true,
          teacher: true,
        },
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: user.student || user.teacher,
          },
          token,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Login failed",
        errors: error,
      };
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          student: true,
          teacher: {
            include: {
              selectedRoles: true,
              selectedSubOptions: {
                include: {
                  option: true,
                },
              },
              selectedDeepOptions: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "Profile retrieved successfully",
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.student || user.teacher,
        },
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message: "Failed to retrieve profile",
        errors: error,
      };
    }
  }

  /**
   * Create admin user (for initial setup)
   */
  static async createAdmin(
    email: string,
    password: string
  ): Promise<ApiResponse> {
    try {
      // Check if admin already exists
      const existingAdmin = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN },
      });

      if (existingAdmin) {
        return {
          success: false,
          message: "Admin user already exists",
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create admin user
      const admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });

      return {
        success: true,
        message: "Admin user created successfully",
        data: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (error) {
      console.error("Create admin error:", error);
      return {
        success: false,
        message: "Failed to create admin user",
        errors: error,
      };
    }
  }
}
