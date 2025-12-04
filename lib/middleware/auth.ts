import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { verifyToken } from "../config/jwt";
import { ApiResponse, AuthenticatedUser } from "../types";
import prisma from "../config/database";

export interface AuthContext {
  user: AuthenticatedUser;
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  request: NextRequest
): Promise<{ success: true; user: AuthenticatedUser } | { success: false; error: ApiResponse }> => {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: {
          success: false,
          message: "Access token required",
        },
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = verifyToken(token);

      // Verify user still exists and is active
      const user = await prisma.user.findFirst({
        where: {
          id: payload.id,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: {
            success: false,
            message: "Invalid or expired token",
          },
        };
      }

      return {
        success: true,
        user,
      };
    } catch (jwtError) {
      return {
        success: false,
        error: {
          success: false,
          message: "Invalid or expired token",
        },
      };
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: {
        success: false,
        message: "Internal server error during authentication",
      },
    };
  }
};

/**
 * Authorization check - checks user roles
 */
export const authorize = (user: AuthenticatedUser, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(user.role);
};

/**
 * Admin only check
 */
export const isAdmin = (user: AuthenticatedUser): boolean => {
  return authorize(user, [UserRole.ADMIN]);
};

/**
 * Teacher only check
 */
export const isTeacher = (user: AuthenticatedUser): boolean => {
  return authorize(user, [UserRole.TEACHER]);
};

/**
 * Student only check
 */
export const isStudent = (user: AuthenticatedUser): boolean => {
  return authorize(user, [UserRole.STUDENT]);
};

/**
 * Teacher or Admin check
 */
export const isTeacherOrAdmin = (user: AuthenticatedUser): boolean => {
  return authorize(user, [UserRole.TEACHER, UserRole.ADMIN]);
};



