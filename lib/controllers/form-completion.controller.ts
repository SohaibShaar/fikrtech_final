import { Response } from "express";
import { FormCompletionService } from "../services/form-completion.service";
import { ApiResponse, AuthenticatedRequest } from "../types";

export class FormCompletionController {
  /**
   * Check if the authenticated user has completed their registration form
   */
  static async checkFormCompletion(
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

      const result = await FormCompletionService.checkFormCompletion(
        req.user.id
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Form completion controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
