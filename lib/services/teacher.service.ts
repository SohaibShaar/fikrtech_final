import { TeacherRole, ApplicationStatus } from "@prisma/client";
import prisma from "../config/database";
import { ApiResponse } from "../types";
import {
  TeacherRegistrationStep1,
  TeacherRegistrationStep2,
  TeacherRegistrationStep3,
  TeacherRegistrationStep4,
  TeacherRegistrationStep5,
  TeacherRegistrationStep6,
  TeacherRegistrationStep7,
  TeacherRegistrationStep8,
  CompleteTeacherRegistration,
} from "../types";

export class TeacherService {
  /**
   * Calculate age from date of birth
   */
  private static calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Save teacher registration step data (temporary storage)
   */
  static async saveRegistrationStep(
    userId: string,
    step: number,
    data: any
  ): Promise<ApiResponse> {
    try {
      // For now, we'll store step data in a simple way
      // In production, you might want to use Redis or a dedicated session table

      // Get or create teacher record
      let teacher = await prisma.teacher.findUnique({
        where: { userId },
      });

      if (!teacher) {
        // Create basic teacher record if it doesn't exist
        teacher = await prisma.teacher.create({
          data: {
            userId,
            fullName: "", // Will be updated in step 1
            gender: "MALE", // Will be updated in step 1
            nationality: "", // Will be updated in step 1
            dateOfBirth: new Date(), // Will be updated in step 1
            age: 0, // Will be updated in step 1
            phone: "", // Will be updated in step 1
          },
        });
      }

      // Update teacher data based on step
      const updateData: any = {};

      switch (step) {
        case 1:
          const step1Data = data as TeacherRegistrationStep1;
          const dateOfBirth = new Date(step1Data.dateOfBirth);
          updateData.fullName = step1Data.fullName;
          updateData.gender = step1Data.gender;
          updateData.nationality = step1Data.nationality;
          updateData.dateOfBirth = dateOfBirth;
          updateData.age = this.calculateAge(dateOfBirth);
          updateData.phone = step1Data.phone;
          if (step1Data.profilePhoto) {
            updateData.profilePhoto = step1Data.profilePhoto;
          }
          break;

        case 5:
          const step5Data = data as TeacherRegistrationStep5;
          if (step5Data.universityAffiliation)
            updateData.universityAffiliation = step5Data.universityAffiliation;
          if (step5Data.highestEducation)
            updateData.highestEducation = step5Data.highestEducation;
          if (step5Data.yearsExperience !== undefined)
            updateData.yearsExperience = step5Data.yearsExperience;
          if (step5Data.languagesSpoken)
            updateData.languagesSpoken = JSON.stringify(
              step5Data.languagesSpoken
            );
          if (step5Data.shortBio) updateData.shortBio = step5Data.shortBio;
          if (step5Data.shortVideo)
            updateData.shortVideo = step5Data.shortVideo;
          break;

        case 6:
          const step6Data = data as TeacherRegistrationStep6;
          if (step6Data.preferredTutoringTime)
            updateData.preferredTutoringTime = step6Data.preferredTutoringTime;
          if (step6Data.preferredTutoringMethod)
            updateData.preferredTutoringMethod =
              step6Data.preferredTutoringMethod;
          if (step6Data.location) updateData.location = step6Data.location;
          if (step6Data.proposedHourlyRate !== undefined)
            updateData.proposedHourlyRate = step6Data.proposedHourlyRate;
          break;

        case 7:
          const step7Data = data as TeacherRegistrationStep7;
          if (step7Data.cvFile) updateData.cvFile = step7Data.cvFile;
          if (step7Data.certificates)
            updateData.certificates = JSON.stringify(step7Data.certificates);
          break;

        case 8:
          const step8Data = data as TeacherRegistrationStep8;
          updateData.agreedToTerms = step8Data.agreedToTerms;
          break;
      }

      // Update teacher record
      if (Object.keys(updateData).length > 0) {
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: updateData,
        });
      }

      // Handle role selections (step 2)
      if (step === 2) {
        const step2Data = data as TeacherRegistrationStep2;

        // Delete existing role selections
        await prisma.teacherRoleSelection.deleteMany({
          where: { teacherId: teacher.id },
        });

        // Create new role selections
        await prisma.teacherRoleSelection.createMany({
          data: step2Data.selectedRoles.map((role) => ({
            teacherId: teacher.id,
            role: role as TeacherRole,
          })),
        });
      }

      // Handle sub-option selections (step 3)
      if (step === 3) {
        const step3Data = data as TeacherRegistrationStep3;

        // Delete existing sub-option selections
        await prisma.teacherSubOptionSelection.deleteMany({
          where: { teacherId: teacher.id },
        });

        // Create new sub-option selections
        await prisma.teacherSubOptionSelection.createMany({
          data: step3Data.selectedSubOptions.map((optionId) => ({
            teacherId: teacher.id,
            optionId,
          })),
        });
      }

      // Handle deep option selections (step 4)
      if (step === 4) {
        const step4Data = data as TeacherRegistrationStep4;

        // Delete existing deep option selections
        await prisma.teacherDeepOptionSelection.deleteMany({
          where: { teacherId: teacher.id },
        });

        // Create new deep option selections
        if (
          step4Data.selectedDeepOptions &&
          step4Data.selectedDeepOptions.length > 0
        ) {
          await prisma.teacherDeepOptionSelection.createMany({
            data: step4Data.selectedDeepOptions.map((optionId) => ({
              teacherId: teacher.id,
              optionId,
            })),
          });
        }

        // Handle custom "Other" options if needed
        if (step4Data.otherOptions && step4Data.otherOptions.length > 0) {
          // Create dynamic options for custom entries
          for (const otherOption of step4Data.otherOptions) {
            const customOption = await prisma.dynamicOption.create({
              data: {
                parentRole: "TUTORING", // Default parent role for custom options
                name: otherOption,
                description: "Custom option added by teacher",
                isActive: true,
              },
            });

            await prisma.teacherDeepOptionSelection.create({
              data: {
                teacherId: teacher.id,
                optionId: customOption.id,
              },
            });
          }
        }
      }

      return {
        success: true,
        message: `Step ${step} data saved successfully`,
        data: { teacherId: teacher.id },
      };
    } catch (error) {
      console.error("Save registration step error:", error);
      return {
        success: false,
        message: "Failed to save registration step data",
        errors: error,
      };
    }
  }

  /**
   * Submit complete teacher registration
   */
  static async submitRegistration(
    userId: string,
    data: CompleteTeacherRegistration
  ): Promise<ApiResponse> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Calculate age
        const dateOfBirth = new Date(data.dateOfBirth);
        const age = this.calculateAge(dateOfBirth);

        // Create or update teacher record
        const teacher = await tx.teacher.upsert({
          where: { userId },
          update: {
            fullName: data.fullName,
            gender: data.gender,
            nationality: data.nationality,
            dateOfBirth,
            age,
            phone: data.phone,
            profilePhoto: data.profilePhoto,
            universityAffiliation: data.universityAffiliation,
            highestEducation: data.highestEducation,
            yearsExperience: data.yearsExperience,
            languagesSpoken: data.languagesSpoken
              ? JSON.stringify(data.languagesSpoken)
              : null,
            shortBio: data.shortBio,
            shortVideo: data.shortVideo,
            preferredTutoringTime: data.preferredTutoringTime,
            preferredTutoringMethod: data.preferredTutoringMethod,
            location: data.location,
            proposedHourlyRate: data.proposedHourlyRate,
            cvFile: data.cvFile,
            certificates: data.certificates
              ? JSON.stringify(data.certificates)
              : null,
            agreedToTerms: data.agreedToTerms,
          },
          create: {
            userId,
            fullName: data.fullName,
            gender: data.gender,
            nationality: data.nationality,
            dateOfBirth,
            age,
            phone: data.phone,
            profilePhoto: data.profilePhoto,
            universityAffiliation: data.universityAffiliation,
            highestEducation: data.highestEducation,
            yearsExperience: data.yearsExperience,
            languagesSpoken: data.languagesSpoken
              ? JSON.stringify(data.languagesSpoken)
              : null,
            shortBio: data.shortBio,
            shortVideo: data.shortVideo,
            preferredTutoringTime: data.preferredTutoringTime,
            preferredTutoringMethod: data.preferredTutoringMethod,
            location: data.location,
            proposedHourlyRate: data.proposedHourlyRate,
            cvFile: data.cvFile,
            certificates: data.certificates
              ? JSON.stringify(data.certificates)
              : null,
            agreedToTerms: data.agreedToTerms,
          },
        });

        // Handle role selections
        await tx.teacherRoleSelection.deleteMany({
          where: { teacherId: teacher.id },
        });

        await tx.teacherRoleSelection.createMany({
          data: data.selectedRoles.map((role) => ({
            teacherId: teacher.id,
            role: role as TeacherRole,
          })),
        });

        // Handle sub-option selections
        await tx.teacherSubOptionSelection.deleteMany({
          where: { teacherId: teacher.id },
        });

        await tx.teacherSubOptionSelection.createMany({
          data: data.selectedSubOptions.map((optionId) => ({
            teacherId: teacher.id,
            optionId,
          })),
        });

        // Handle deep option selections
        await tx.teacherDeepOptionSelection.deleteMany({
          where: { teacherId: teacher.id },
        });

        if (data.selectedDeepOptions && data.selectedDeepOptions.length > 0) {
          await tx.teacherDeepOptionSelection.createMany({
            data: data.selectedDeepOptions.map((optionId) => ({
              teacherId: teacher.id,
              optionId,
            })),
          });
        }

        // Create teacher application
        const application = await tx.teacherApplication.create({
          data: {
            status: ApplicationStatus.PENDING,
            applicationData: data as any,
          },
        });

        // Link teacher to application
        await tx.teacher.update({
          where: { id: teacher.id },
          data: { applicationId: application.id },
        });

        return { teacher, application };
      });

      return {
        success: true,
        message: "Teacher registration submitted successfully",
        data: {
          teacherId: result.teacher.id,
          applicationId: result.application.id,
          status: result.application.status,
        },
      };
    } catch (error) {
      console.error("Submit registration error:", error);
      return {
        success: false,
        message: "Failed to submit teacher registration",
        errors: error,
      };
    }
  }

  /**
   * Get teacher registration progress
   */
  static async getRegistrationProgress(userId: string): Promise<ApiResponse> {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
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
          teacherApplication: true,
        },
      });

      if (!teacher) {
        return {
          success: true,
          message: "No registration data found",
          data: { progress: 0, completedSteps: [] },
        };
      }

      // Calculate progress based on completed fields
      const completedSteps = [];

      // Step 1: Basic info
      if (
        teacher.fullName &&
        teacher.gender &&
        teacher.nationality &&
        teacher.dateOfBirth &&
        teacher.phone
      ) {
        completedSteps.push(1);
      }

      // Step 2: Roles
      if (teacher.selectedRoles.length > 0) {
        completedSteps.push(2);
      }

      // Step 3: Sub-options
      if (teacher.selectedSubOptions.length > 0) {
        completedSteps.push(3);
      }

      // Step 4: Deep options (optional, so always consider complete if step 3 is complete)
      if (completedSteps.includes(3)) {
        completedSteps.push(4);
      }

      // Step 5: Education info (optional fields, so consider complete if any field is filled)
      if (
        teacher.universityAffiliation ||
        teacher.highestEducation ||
        teacher.yearsExperience ||
        teacher.languagesSpoken ||
        teacher.shortBio
      ) {
        completedSteps.push(5);
      }

      // Step 6: Tutoring preferences (optional)
      if (
        teacher.preferredTutoringTime ||
        teacher.preferredTutoringMethod ||
        teacher.location ||
        teacher.proposedHourlyRate
      ) {
        completedSteps.push(6);
      }

      // Step 7: Files (optional)
      if (teacher.cvFile || teacher.certificates) {
        completedSteps.push(7);
      }

      // Step 8: Agreement
      if (teacher.agreedToTerms) {
        completedSteps.push(8);
      }

      const progress = Math.round((completedSteps.length / 8) * 100);

      return {
        success: true,
        message: "Registration progress retrieved successfully",
        data: {
          progress,
          completedSteps,
          teacher,
          application: teacher.teacherApplication,
        },
      };
    } catch (error) {
      console.error("Get registration progress error:", error);
      return {
        success: false,
        message: "Failed to retrieve registration progress",
        errors: error,
      };
    }
  }

  /**
   * Get dynamic options for a specific role (Step 3)
   */
  static async getDynamicOptions(role?: TeacherRole): Promise<ApiResponse> {
    try {
      const options = await prisma.dynamicOption.findMany({
        where: {
          parentRole: role,
          parentId: null, // Top-level options only
          isActive: true,
        },
        orderBy: { sortOrder: "asc" },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      return {
        success: true,
        message: "Dynamic options retrieved successfully",
        data: options,
      };
    } catch (error) {
      console.error("Get dynamic options error:", error);
      return {
        success: false,
        message: "Failed to retrieve dynamic options",
        errors: error,
      };
    }
  }

  /**
   * Get deep options for selected sub-options (Step 4)
   */
  static async getDeepOptions(parentIds: string[]): Promise<ApiResponse> {
    try {
      const options = await prisma.dynamicOption.findMany({
        where: {
          parentId: { in: parentIds },
          isActive: true,
        },
        orderBy: { sortOrder: "asc" },
        include: {
          parent: true,
        },
      });

      return {
        success: true,
        message: "Deep options retrieved successfully",
        data: options,
      };
    } catch (error) {
      console.error("Get deep options error:", error);
      return {
        success: false,
        message: "Failed to retrieve deep options",
        errors: error,
      };
    }
  }

  /**
   * Get teacher profile
   */
  static async getProfile(userId: string): Promise<ApiResponse> {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          selectedRoles: {
            include: {
              teacher: false,
            },
          },
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
          teacherApplication: true,
          courses: {
            where: {
              isActive: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher profile not found",
        };
      }

      return {
        success: true,
        message: "Teacher profile retrieved successfully",
        data: teacher,
      };
    } catch (error) {
      console.error("Get teacher profile error:", error);
      return {
        success: false,
        message: "Failed to retrieve teacher profile",
        errors: error,
      };
    }
  }

  /**
   * Update teacher profile
   */
  static async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      phone?: string;
      shortBio?: string;
      profilePhoto?: string;
      languagesSpoken?: string[];
      proposedHourlyRate?: number;
    }
  ): Promise<ApiResponse> {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher profile not found",
        };
      }

      const updateData: any = {};

      if (data.fullName) updateData.fullName = data.fullName;
      if (data.phone) updateData.phone = data.phone;
      if (data.shortBio !== undefined) updateData.shortBio = data.shortBio;
      if (data.profilePhoto !== undefined)
        updateData.profilePhoto = data.profilePhoto;
      if (data.languagesSpoken)
        updateData.languagesSpoken = JSON.stringify(data.languagesSpoken);
      if (data.proposedHourlyRate !== undefined)
        updateData.proposedHourlyRate = data.proposedHourlyRate;

      const updatedTeacher = await prisma.teacher.update({
        where: { id: teacher.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Teacher profile updated successfully",
        data: updatedTeacher,
      };
    } catch (error) {
      console.error("Update teacher profile error:", error);
      return {
        success: false,
        message: "Failed to update teacher profile",
        errors: error,
      };
    }
  }
}
