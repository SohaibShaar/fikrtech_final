import { CourseStatus, Prisma } from "@prisma/client";
import prisma from "../config/database";
import { ApiResponse } from "../types";

export interface CreateCourseData {
  title: string;
  description?: string;
  subject: string;
  grade?: string;
  curriculum?: string;
  price: number;
  duration?: number;
  maxStudents?: number;
  thumbnail?: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  subject?: string;
  grade?: string;
  curriculum?: string;
  price?: number;
  duration?: number;
  maxStudents?: number;
  thumbnail?: string;
  isActive?: boolean;
}

export class CourseService {
  /**
   * Create a new course
   */
  static async createCourse(
    teacherId: string,
    data: CreateCourseData
  ): Promise<ApiResponse> {
    try {
      // Verify teacher exists and is approved
      const teacher = await prisma.teacher.findUnique({
        where: { userId: teacherId },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher profile not found. Please complete your registration first.",
        };
      }

      if (!teacher.isApproved) {
        return {
          success: false,
          message: "Your teacher profile is pending approval. You can create courses once approved.",
        };
      }

      const course = await prisma.course.create({
        data: {
          teacherId: teacher.id,
          title: data.title,
          description: data.description,
          subject: data.subject,
          grade: data.grade as any,
          curriculum: data.curriculum as any,
          price: data.price,
          duration: data.duration,
          maxStudents: data.maxStudents,
          thumbnail: data.thumbnail,
          status: CourseStatus.PENDING,
        },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Course created successfully and submitted for approval",
        data: course,
      };
    } catch (error) {
      console.error("Create course error:", error);
      return {
        success: false,
        message: "Failed to create course",
        errors: error,
      };
    }
  }

  /**
   * Update a course
   */
  static async updateCourse(
    courseId: string,
    teacherId: string,
    data: UpdateCourseData
  ): Promise<ApiResponse> {
    try {
      // Get teacher
      const teacher = await prisma.teacher.findUnique({
        where: { userId: teacherId },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher profile not found",
        };
      }

      // Verify course ownership
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found",
        };
      }

      if (course.teacherId !== teacher.id) {
        return {
          success: false,
          message: "You are not authorized to update this course",
        };
      }

      // Update course
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.subject && { subject: data.subject }),
          ...(data.grade && { grade: data.grade as any }),
          ...(data.curriculum && { curriculum: data.curriculum as any }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.duration !== undefined && { duration: data.duration }),
          ...(data.maxStudents !== undefined && { maxStudents: data.maxStudents }),
          ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          // Reset to pending if content changed
          ...(data.title || data.description || data.subject) && { status: CourseStatus.PENDING },
        },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      };
    } catch (error) {
      console.error("Update course error:", error);
      return {
        success: false,
        message: "Failed to update course",
        errors: error,
      };
    }
  }

  /**
   * Delete a course (soft delete)
   */
  static async deleteCourse(
    courseId: string,
    teacherId: string
  ): Promise<ApiResponse> {
    try {
      // Get teacher
      const teacher = await prisma.teacher.findUnique({
        where: { userId: teacherId },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher profile not found",
        };
      }

      // Verify course ownership
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found",
        };
      }

      if (course.teacherId !== teacher.id) {
        return {
          success: false,
          message: "You are not authorized to delete this course",
        };
      }

      // Soft delete by setting isActive to false
      await prisma.course.update({
        where: { id: courseId },
        data: { isActive: false },
      });

      return {
        success: true,
        message: "Course deleted successfully",
      };
    } catch (error) {
      console.error("Delete course error:", error);
      return {
        success: false,
        message: "Failed to delete course",
        errors: error,
      };
    }
  }

  /**
   * Get all courses by teacher
   */
  static async getTeacherCourses(teacherId: string): Promise<ApiResponse> {
    try {
      // Get teacher
      const teacher = await prisma.teacher.findUnique({
        where: { userId: teacherId },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher profile not found",
        };
      }

      const courses = await prisma.course.findMany({
        where: {
          teacherId: teacher.id,
          isActive: true,
        },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        message: "Courses retrieved successfully",
        data: courses,
      };
    } catch (error) {
      console.error("Get teacher courses error:", error);
      return {
        success: false,
        message: "Failed to retrieve courses",
        errors: error,
      };
    }
  }

  /**
   * Get course by ID
   */
  static async getCourseById(courseId: string): Promise<ApiResponse> {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              shortBio: true,
              yearsExperience: true,
              languagesSpoken: true,
            },
          },
        },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found",
        };
      }

      return {
        success: true,
        message: "Course retrieved successfully",
        data: course,
      };
    } catch (error) {
      console.error("Get course by ID error:", error);
      return {
        success: false,
        message: "Failed to retrieve course",
        errors: error,
      };
    }
  }

  /**
   * Get approved courses for public viewing
   */
  static async getPublicCourses(filters?: {
    subject?: string;
    grade?: string;
    curriculum?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ApiResponse> {
    try {
      const where: Prisma.CourseWhereInput = {
        status: CourseStatus.APPROVED,
        isActive: true,
      };

      if (filters?.subject) {
        where.subject = filters.subject;
      }

      if (filters?.grade) {
        where.grade = filters.grade as any;
      }

      if (filters?.curriculum) {
        where.curriculum = filters.curriculum as any;
      }

      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
          { subject: { contains: filters.search } },
        ];
      }

      const courses = await prisma.course.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              shortBio: true,
              yearsExperience: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        message: "Public courses retrieved successfully",
        data: courses,
      };
    } catch (error) {
      console.error("Get public courses error:", error);
      return {
        success: false,
        message: "Failed to retrieve courses",
        errors: error,
      };
    }
  }

  /**
   * Get all courses (admin only)
   */
  static async getAllCourses(filters?: {
    status?: CourseStatus;
    teacherId?: string;
    search?: string;
  }): Promise<ApiResponse> {
    try {
      const where: Prisma.CourseWhereInput = {
        isActive: true,
      };

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.teacherId) {
        where.teacherId = filters.teacherId;
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
          { subject: { contains: filters.search } },
        ];
      }

      const courses = await prisma.course.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              phone: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        message: "All courses retrieved successfully",
        data: courses,
      };
    } catch (error) {
      console.error("Get all courses error:", error);
      return {
        success: false,
        message: "Failed to retrieve courses",
        errors: error,
      };
    }
  }

  /**
   * Approve course (admin only)
   */
  static async approveCourse(courseId: string): Promise<ApiResponse> {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found",
        };
      }

      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          status: CourseStatus.APPROVED,
        },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Course approved successfully",
        data: updatedCourse,
      };
    } catch (error) {
      console.error("Approve course error:", error);
      return {
        success: false,
        message: "Failed to approve course",
        errors: error,
      };
    }
  }

  /**
   * Reject course (admin only)
   */
  static async rejectCourse(
    courseId: string,
    rejectionNotes?: string
  ): Promise<ApiResponse> {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found",
        };
      }

      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          status: CourseStatus.REJECTED,
        },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Course rejected successfully",
        data: { course: updatedCourse, rejectionNotes },
      };
    } catch (error) {
      console.error("Reject course error:", error);
      return {
        success: false,
        message: "Failed to reject course",
        errors: error,
      };
    }
  }
}

