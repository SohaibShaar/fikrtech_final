import { Request, Response } from "express";
import { StudentService } from "../services/student.service";
import { AuthenticatedRequest } from "../types";
import {
  studentRegistrationSchema,
  studentLoginSchema,
  getValidationSchemaByStep,
} from "../validation/student";

const studentService = new StudentService();

export class StudentController {
  /**
   * Register a new student
   * POST /api/student/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = studentRegistrationSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await studentService.registerStudent(value);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Student registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Student login
   * POST /api/student/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = studentLoginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const { email, password } = value;
      const result = await studentService.loginStudent(email, password);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error("Student login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get student profile
   * GET /api/student/profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Get student ID from user
      const user = await studentService.getOrCreateStudentByUserId(req.user.id);
      if (!user.success) {
        res.status(404).json(user);
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Get student profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get form progress
   * GET /api/student/form/progress
   */
  async getFormProgress(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Get student record to find student ID
      const studentResult = await studentService.getOrCreateStudentByUserId(
        req.user.id
      );
      if (!studentResult.success || !studentResult.data) {
        // If student profile doesn't exist, return empty progress to start from step 1
        res.status(200).json({
          success: true,
          message: "No form progress found - starting from step 1",
          data: null,
        });
        return;
      }

      const result = await studentService.getFormProgress(
        studentResult.data.id
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Get form progress error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Save form step
   * POST /api/student/form/step/:stepNumber
   */
  async saveFormStep(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const stepNumber = parseInt(req.params.stepNumber);

      // Validate step number
      if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 10) {
        res.status(400).json({
          success: false,
          message: "Invalid step number. Must be between 1 and 10.",
        });
        return;
      }

      // Validate step data
      const validationSchema = getValidationSchemaByStep(stepNumber);
      if (!validationSchema) {
        res.status(400).json({
          success: false,
          message: "Invalid step number",
        });
        return;
      }

      const { error, value } = validationSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      // Get student record to find student ID
      const studentResult = await studentService.getOrCreateStudentByUserId(
        req.user.id
      );
      if (!studentResult.success || !studentResult.data) {
        console.error("Student creation failed:", studentResult.message);
        res.status(404).json({
          success: false,
          message: studentResult.message || "Student not found",
        });
        return;
      }

      const result = await studentService.saveFormStep(
        studentResult.data.id,
        stepNumber,
        value
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Save form step error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get dynamic materials for step 6
   * GET /api/student/materials
   */
  async getDynamicMaterials(req: Request, res: Response): Promise<void> {
    try {
      const result = await studentService.getDynamicMaterials();
      res.status(200).json(result);
    } catch (error) {
      console.error("Get dynamic materials error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Create student record for current user
   * POST /api/student/create-profile
   */
  async createStudentProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await studentService.createStudentFromUser(req.user.id);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Create student profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Check form completion status
   * GET /api/student/form/status
   */
  async getFormStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Get student record to find student ID
      const studentResult = await studentService.getOrCreateStudentByUserId(
        req.user.id
      );
      if (!studentResult.success || !studentResult.data) {
        res.status(404).json({
          success: false,
          message: "Student not found",
        });
        return;
      }

      const isCompleted = await studentService.isFormCompleted(
        studentResult.data.id
      );

      res.status(200).json({
        success: true,
        message: "Form status retrieved successfully",
        data: {
          isCompleted,
          needsFormCompletion: !isCompleted,
        },
      });
    } catch (error) {
      console.error("Get form status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all students (Admin only)
   * GET /api/student/all
   */
  async getAllStudents(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({
          success: false,
          message: "Access denied. Admin role required.",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await studentService.getAllStudents(page, limit);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Get all students error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get specific student details (Admin only)
   * GET /api/student/:studentId
   */
  async getStudentById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({
          success: false,
          message: "Access denied. Admin role required.",
        });
        return;
      }

      const { studentId } = req.params;

      const result = await studentService.getStudentProfile(studentId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Get student by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
