import { Response } from "express";
import { CourseService } from "../services/course.service";
import {
  createCourseSchema,
  updateCourseSchema,
  courseFiltersSchema,
} from "../validation/course";
import { ApiResponse, AuthenticatedRequest } from "../types";

export class CourseController {
  /**
   * Create a new course
   */
  static async createCourse(
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

      // Validate request body
      const { error, value } = createCourseSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await CourseService.createCourse(req.user.id, value);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Create course controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update a course
   */
  static async updateCourse(
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

      const courseId = req.params.id;
      if (!courseId) {
        res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateCourseSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await CourseService.updateCourse(
        courseId,
        req.user.id,
        value
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Update course controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Delete a course
   */
  static async deleteCourse(
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

      const courseId = req.params.id;
      if (!courseId) {
        res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
        return;
      }

      const result = await CourseService.deleteCourse(courseId, req.user.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Delete course controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get teacher's courses
   */
  static async getTeacherCourses(
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

      const result = await CourseService.getTeacherCourses(req.user.id);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get teacher courses controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get course by ID
   */
  static async getCourseById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const courseId = req.params.id;
      if (!courseId) {
        res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
        return;
      }

      const result = await CourseService.getCourseById(courseId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Get course by ID controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get public courses
   */
  static async getPublicCourses(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      // Validate query parameters
      const { error, value } = courseFiltersSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await CourseService.getPublicCourses(value);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get public courses controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all courses (admin only)
   */
  static async getAllCourses(
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

      // Validate query parameters
      const { error, value } = courseFiltersSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await CourseService.getAllCourses(value);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get all courses controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Approve course (admin only)
   */
  static async approveCourse(
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

      const courseId = req.params.id;
      if (!courseId) {
        res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
        return;
      }

      const result = await CourseService.approveCourse(courseId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Approve course controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Reject course (admin only)
   */
  static async rejectCourse(
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

      const courseId = req.params.id;
      if (!courseId) {
        res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
        return;
      }

      const { rejectionNotes } = req.body;

      const result = await CourseService.rejectCourse(courseId, rejectionNotes);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Reject course controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

