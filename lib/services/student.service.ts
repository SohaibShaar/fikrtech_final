import { PrismaClient, Student, StudentFormResponse } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  StudentRegistrationData,
  StudentFormStep1,
  StudentFormStep2,
  StudentFormStep3,
  StudentFormStep4,
  StudentFormStep5,
  StudentFormStep6,
  StudentFormStep7,
  StudentFormStep8,
  StudentFormStep9,
  StudentFormStep10,
  ApiResponse,
} from "../types";

const prisma = new PrismaClient();

export class StudentService {
  /**
   * Register a new student
   */
  async registerStudent(
    registrationData: StudentRegistrationData & { password: string }
  ): Promise<ApiResponse<{ student: Student; token: string }>> {
    try {
      const {
        email,
        password,
        fullName,
        gender,
        nationality,
        dateOfBirth,
        phone,
      } = registrationData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists",
        };
      }

      // Calculate age from date of birth
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user and student in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "STUDENT",
          },
        });

        // Create student profile
        const student = await tx.student.create({
          data: {
            userId: user.id,
            fullName,
            gender,
            nationality,
            dateOfBirth: birthDate,
            age,
            phone,
          },
          include: {
            user: true,
          },
        });

        return { user, student };
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Student registered successfully",
        data: {
          student: result.student,
          token,
        },
      };
    } catch (error) {
      console.error("Student registration error:", error);
      return {
        success: false,
        message: "Failed to register student",
        errors: error,
      };
    }
  }

  /**
   * Student login
   */
  async loginStudent(
    email: string,
    password: string
  ): Promise<
    ApiResponse<{
      student: Student;
      token: string;
      needsFormCompletion: boolean;
    }>
  > {
    try {
      // Find user with student profile
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          student: {
            include: {
              formResponses: true,
            },
          },
        },
      });

      if (!user || user.role !== "STUDENT") {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      if (!user.student) {
        return {
          success: false,
          message: "Student profile not found",
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      // Check if form completion is needed
      const needsFormCompletion = !user.student.isFormCompleted;

      return {
        success: true,
        message: "Login successful",
        data: {
          student: user.student,
          token,
          needsFormCompletion,
        },
      };
    } catch (error) {
      console.error("Student login error:", error);
      return {
        success: false,
        message: "Login failed",
        errors: error,
      };
    }
  }

  /**
   * Get student form progress
   */
  async getFormProgress(
    studentId: string
  ): Promise<ApiResponse<StudentFormResponse | null>> {
    try {
      const formResponse = await prisma.studentFormResponse.findUnique({
        where: { studentId },
      });

      return {
        success: true,
        message: "Form progress retrieved successfully",
        data: formResponse,
      };
    } catch (error) {
      console.error("Get form progress error:", error);
      return {
        success: false,
        message: "Failed to get form progress",
        errors: error,
      };
    }
  }

  /**
   * Save form step data
   */
  async saveFormStep(
    studentId: string,
    step: number,
    stepData: any
  ): Promise<ApiResponse<StudentFormResponse>> {
    try {
      // Check if form response exists
      let formResponse = await prisma.studentFormResponse.findUnique({
        where: { studentId },
      });

      // Prepare update data based on step
      const updateData: any = {
        currentStep: Math.max(step, formResponse?.currentStep || 1),
      };

      switch (step) {
        case 1:
          const step1Data = stepData as StudentFormStep1;
          updateData.studentType = step1Data.studentType;
          break;
        case 2:
          const step2Data = stepData as StudentFormStep2;
          updateData.inclusiveLearning = step2Data.inclusiveLearning;
          break;
        case 3:
          const step3Data = stepData as StudentFormStep3;
          updateData.formGender = step3Data.formGender;
          break;
        case 4:
          const step4Data = stepData as StudentFormStep4;
          updateData.curriculum = step4Data.curriculum;
          break;
        case 5:
          const step5Data = stepData as StudentFormStep5;
          updateData.grade = step5Data.grade;
          break;
        case 6:
          const step6Data = stepData as StudentFormStep6;
          updateData.selectedCategories = JSON.stringify(
            step6Data.selectedCategories
          );
          break;
        case 7:
          const step7Data = stepData as StudentFormStep7;
          updateData.selectedSubcategories = JSON.stringify(
            step7Data.selectedSubcategories
          );
          break;
        case 8:
          const step8Data = stepData as StudentFormStep8;
          updateData.preferredTime = step8Data.preferredTime;
          break;
        case 9:
          const step9Data = stepData as StudentFormStep9;
          updateData.preferredTutor = step9Data.preferredTutor;
          break;
        case 10:
          const step10Data = stepData as StudentFormStep10;
          updateData.sessionType = step10Data.sessionType;
          // Mark as completed if this is the final step
          updateData.isCompleted = true;
          updateData.completedAt = new Date();
          break;
      }

      // Update or create form response
      if (formResponse) {
        formResponse = await prisma.studentFormResponse.update({
          where: { studentId },
          data: updateData,
        });
      } else {
        formResponse = await prisma.studentFormResponse.create({
          data: {
            studentId,
            ...updateData,
          },
        });
      }

      // If form is completed, update student record
      if (step === 9) {
        await prisma.student.update({
          where: { id: studentId },
          data: { isFormCompleted: true },
        });
      }

      return {
        success: true,
        message: `Step ${step} saved successfully`,
        data: formResponse,
      };
    } catch (error) {
      console.error("Save form step error:", error);
      return {
        success: false,
        message: "Failed to save form step",
        errors: error,
      };
    }
  }

  /**
   * Get dynamic materials (options for step 6)
   */
  async getDynamicMaterials(): Promise<ApiResponse<any[]>> {
    try {
      // Get all dynamic options that don't have a parent (top-level options)
      const materials = await prisma.dynamicOption.findMany({
        where: {
          parentId: null,
          isActive: true,
        },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      });

      return {
        success: true,
        message: "Dynamic materials retrieved successfully",
        data: materials,
      };
    } catch (error) {
      console.error("Get dynamic materials error:", error);
      return {
        success: false,
        message: "Failed to get dynamic materials",
        errors: error,
      };
    }
  }

  /**
   * Create student record from existing user
   */
  async createStudentFromUser(userId: string): Promise<ApiResponse<Student>> {
    try {
      console.log("Creating student for user ID:", userId);

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.log("User not found for ID:", userId);
        return {
          success: false,
          message: "User not found",
        };
      }

      console.log("User found:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      if (user.role !== "STUDENT") {
        console.log("User role is not STUDENT:", user.role);
        return {
          success: false,
          message: `User is not a student. Current role: ${user.role}`,
        };
      }

      // Create student record with default values
      const student = await prisma.student.create({
        data: {
          userId: userId,
          fullName: "Student", // Default name, will be updated in form
          gender: "OTHER",
          nationality: "Unknown",
          dateOfBirth: new Date("2005-01-01"),
          age: 18,
          phone: "Not provided",
          isFormCompleted: false,
        },
      });

      return {
        success: true,
        message: "Student record created successfully",
        data: student,
      };
    } catch (error) {
      console.error("Create student from user error:", error);
      return {
        success: false,
        message: "Failed to create student record",
        errors: error,
      };
    }
  }

  /**
   * Get student profile by userId (create if not exists)
   */
  async getOrCreateStudentByUserId(
    userId: string
  ): Promise<
    ApiResponse<Student & { formResponses: StudentFormResponse | null }>
  > {
    try {
      console.log("Getting or creating student for user ID:", userId);

      // First try to find existing student
      let student = await prisma.student.findUnique({
        where: { userId: userId },
        include: {
          formResponses: true,
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
        },
      });

      console.log("Existing student found:", !!student);

      // If student doesn't exist, create one
      if (!student) {
        console.log("Creating new student record...");
        const createResult = await this.createStudentFromUser(userId);
        if (!createResult.success) {
          console.log("Failed to create student:", createResult.message);
          return createResult as any;
        }

        // Fetch the newly created student with relations
        student = await prisma.student.findUnique({
          where: { userId: userId },
          include: {
            formResponses: true,
            user: {
              select: {
                email: true,
                createdAt: true,
              },
            },
          },
        });

        if (!student) {
          return {
            success: false,
            message: "Failed to create student record",
          };
        }
      }

      return {
        success: true,
        message: "Student profile retrieved successfully",
        data: student as any,
      };
    } catch (error) {
      console.error("Get or create student by userId error:", error);
      return {
        success: false,
        message: "Failed to get student profile",
        errors: error,
      };
    }
  }

  /**
   * Get student profile by userId
   */
  async getStudentProfileByUserId(
    userId: string
  ): Promise<
    ApiResponse<Student & { formResponses: StudentFormResponse | null }>
  > {
    try {
      const student = await prisma.student.findUnique({
        where: { userId: userId },
        include: {
          formResponses: true,
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
        },
      });

      if (!student) {
        return {
          success: false,
          message: "Student not found",
        };
      }

      return {
        success: true,
        message: "Student profile retrieved successfully",
        data: student as any,
      };
    } catch (error) {
      console.error("Get student profile by userId error:", error);
      return {
        success: false,
        message: "Failed to get student profile",
        errors: error,
      };
    }
  }

  /**
   * Get student profile with form responses
   */
  async getStudentProfile(
    studentId: string
  ): Promise<
    ApiResponse<Student & { formResponses: StudentFormResponse | null }>
  > {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          formResponses: true,
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
        },
      });

      if (!student) {
        return {
          success: false,
          message: "Student not found",
        };
      }

      return {
        success: true,
        message: "Student profile retrieved successfully",
        data: student as any,
      };
    } catch (error) {
      console.error("Get student profile error:", error);
      return {
        success: false,
        message: "Failed to get student profile",
        errors: error,
      };
    }
  }

  /**
   * Check if student form is completed
   */
  async isFormCompleted(studentId: string): Promise<boolean> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { isFormCompleted: true },
      });

      return student?.isFormCompleted || false;
    } catch (error) {
      console.error("Check form completion error:", error);
      return false;
    }
  }

  /**
   * Get all students (for admin)
   */
  async getAllStudents(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<any>> {
    try {
      const skip = (page - 1) * limit;

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: {
                email: true,
                createdAt: true,
                isActive: true,
              },
            },
            formResponses: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.student.count(),
      ]);

      return {
        success: true,
        message: "Students retrieved successfully",
        data: {
          students,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Get all students error:", error);
      return {
        success: false,
        message: "Failed to get students",
        errors: error,
      };
    }
  }
}
