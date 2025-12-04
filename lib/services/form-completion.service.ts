import { UserRole } from "@prisma/client";
import prisma from "../config/database";
import { ApiResponse } from "../types";

export class FormCompletionService {
  /**
   * Check if a user has completed their registration form
   */
  static async checkFormCompletion(userId: string): Promise<ApiResponse> {
    try {
      // Get user with role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          student: {
            select: {
              isFormCompleted: true,
              formResponses: {
                select: {
                  isCompleted: true,
                  currentStep: true,
                },
              },
            },
          },
          teacher: {
            select: {
              agreedToTerms: true,
              selectedRoles: true,
              selectedSubOptions: true,
              selectedDeepOptions: true,
              cvFile: true,
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

      // Check form completion based on user role
      if (user.role === UserRole.STUDENT) {
        const isCompleted = user.student?.isFormCompleted || false;
        const currentStep = user.student?.formResponses?.currentStep || 1;
        const totalSteps = 9; // Total steps in student form

        return {
          success: true,
          message: "Student form completion status retrieved",
          data: {
            isCompleted,
            currentStep,
            totalSteps,
            progress: isCompleted
              ? 100
              : Math.round((currentStep / totalSteps) * 100),
          },
        };
      } else if (user.role === UserRole.TEACHER) {
        // For teachers, check if they have completed all required fields
        // We consider a teacher form complete if they have:
        // 1. Agreed to terms
        // 2. Selected at least one role
        // 3. Selected at least one sub-option
        // 4. Uploaded a CV
        const hasAgreedToTerms = user.teacher?.agreedToTerms || false;
        const hasSelectedRoles = (user.teacher?.selectedRoles?.length || 0) > 0;
        const hasSelectedSubOptions =
          (user.teacher?.selectedSubOptions?.length || 0) > 0;
        const hasUploadedCV = !!user.teacher?.cvFile;

        const isCompleted =
          hasAgreedToTerms &&
          hasSelectedRoles &&
          hasSelectedSubOptions &&
          hasUploadedCV;

        // Calculate progress (simplified)
        let progress = 0;
        if (hasAgreedToTerms) progress += 25;
        if (hasSelectedRoles) progress += 25;
        if (hasSelectedSubOptions) progress += 25;
        if (hasUploadedCV) progress += 25;

        return {
          success: true,
          message: "Teacher form completion status retrieved",
          data: {
            isCompleted,
            progress,
            formDetails: {
              hasAgreedToTerms,
              hasSelectedRoles,
              hasSelectedSubOptions,
              hasUploadedCV,
            },
          },
        };
      } else {
        return {
          success: false,
          message: "Form completion check not applicable for this user role",
        };
      }
    } catch (error) {
      console.error("Form completion check error:", error);
      return {
        success: false,
        message: "Failed to check form completion status",
        errors: error,
      };
    }
  }
}
