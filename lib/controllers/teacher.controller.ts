import { Request, Response } from "express";
import { TeacherRole } from "@prisma/client";
import { TeacherService } from "../services/teacher.service";
import {
  teacherStep1Schema,
  teacherStep2Schema,
  teacherStep3Schema,
  teacherStep4Schema,
  teacherStep5Schema,
  teacherStep6Schema,
  teacherStep7Schema,
  teacherStep8Schema,
  completeTeacherRegistrationSchema,
} from "../validation/teacher";
import { ApiResponse, AuthenticatedRequest } from "../types";

export class TeacherController {
  /**
   * Save teacher registration step data
   */
  static async saveRegistrationStep(
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

      const step = parseInt(req.params.step);
      if (!step || step < 1 || step > 8) {
        res.status(400).json({
          success: false,
          message: "Invalid step number. Must be between 1 and 8.",
        });
        return;
      }

      // Validate based on step
      let validationSchema;
      switch (step) {
        case 1:
          validationSchema = teacherStep1Schema;
          break;
        case 2:
          validationSchema = teacherStep2Schema;
          break;
        case 3:
          validationSchema = teacherStep3Schema;
          break;
        case 4:
          validationSchema = teacherStep4Schema;
          break;
        case 5:
          validationSchema = teacherStep5Schema;
          break;
        case 6:
          validationSchema = teacherStep6Schema;
          break;
        case 7:
          validationSchema = teacherStep7Schema;
          break;
        case 8:
          validationSchema = teacherStep8Schema;
          break;
        default:
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
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await TeacherService.saveRegistrationStep(
        req.user.id,
        step,
        value
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Save registration step controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Submit complete teacher registration
   */
  static async submitRegistration(
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

      // Validate complete registration data
      const { error, value } = completeTeacherRegistrationSchema.validate(
        req.body
      );
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await TeacherService.submitRegistration(
        req.user.id,
        value
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Submit registration controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get teacher registration progress
   */
  static async getRegistrationProgress(
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

      const result = await TeacherService.getRegistrationProgress(req.user.id);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get registration progress controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get dynamic options for step 3
   */
  static async getDynamicOptions(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const role = req.query.role as TeacherRole | undefined;

      if (
        role &&
        !["TUTORING", "PROJECTS_MAKER", "COURSING", "COACHING"].includes(role)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid role parameter",
        });
        return;
      }

      const result = await TeacherService.getDynamicOptions(role);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get dynamic options controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get deep options for step 4
   */
  static async getDeepOptions(
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const parentIds = req.body.parentIds as string[];

      if (!Array.isArray(parentIds) || parentIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "parentIds array is required",
        });
        return;
      }

      const result = await TeacherService.getDeepOptions(parentIds);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get deep options controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Handle file upload for teacher registration
   */
  static async uploadFile(
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

      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;
      const file = req.file;

      if (!files && !file) {
        res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
        return;
      }

      const uploadedFiles: { [key: string]: string | string[] } = {};

      // Handle single file upload
      if (file) {
        uploadedFiles[file.fieldname] = file.filename;
      }

      // Handle multiple files upload
      if (files) {
        Object.keys(files).forEach((fieldname) => {
          const fieldFiles = files[fieldname];
          if (fieldFiles.length === 1) {
            uploadedFiles[fieldname] = fieldFiles[0].filename;
          } else {
            uploadedFiles[fieldname] = fieldFiles.map((f) => f.filename);
          }
        });
      }

      res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        data: uploadedFiles,
      });
    } catch (error) {
      console.error("Upload file controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get teacher profile
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

      const result = await TeacherService.getProfile(req.user.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Get teacher profile controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update teacher profile
   */
  static async updateProfile(
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

      const result = await TeacherService.updateProfile(req.user.id, req.body);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Update teacher profile controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
