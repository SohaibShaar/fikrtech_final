import { ApplicationStatus, TeacherRole } from "@prisma/client";
import prisma from "../config/database";
import { ApiResponse, PaginatedResponse } from "../types";

export class AdminService {
  /**
   * Get all teacher applications with pagination and filtering
   */
  static async getTeacherApplications(
    page: number = 1,
    limit: number = 10,
    filters: {
      status?: ApplicationStatus;
      role?: TeacherRole;
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.submittedAt = {};
        if (filters.dateFrom) {
          where.submittedAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.submittedAt.lte = filters.dateTo;
        }
      }

      // If role filter is provided, we need to filter by teacher's selected roles
      if (filters.role) {
        where.teacher = {
          selectedRoles: {
            some: {
              role: filters.role,
            },
          },
        };
      }

      const [applications, total] = await Promise.all([
        prisma.teacherApplication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { submittedAt: "desc" },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
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
        }),
        prisma.teacherApplication.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Teacher applications retrieved successfully",
        data: applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Get teacher applications error:", error);
      return {
        success: false,
        message: "Failed to retrieve teacher applications",
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  /**
   * Get a specific teacher application by ID
   */
  static async getTeacherApplication(
    applicationId: string
  ): Promise<ApiResponse> {
    try {
      const application = await prisma.teacherApplication.findUnique({
        where: { id: applicationId },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
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

      if (!application) {
        return {
          success: false,
          message: "Teacher application not found",
        };
      }

      return {
        success: true,
        message: "Teacher application retrieved successfully",
        data: application,
      };
    } catch (error) {
      console.error("Get teacher application error:", error);
      return {
        success: false,
        message: "Failed to retrieve teacher application",
        errors: error,
      };
    }
  }

  /**
   * Review teacher application (approve or reject)
   */
  static async reviewTeacherApplication(
    applicationId: string,
    adminUserId: string,
    status: ApplicationStatus,
    reviewNotes?: string
  ): Promise<ApiResponse> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Update application status
        const application = await tx.teacherApplication.update({
          where: { id: applicationId },
          data: {
            status,
            reviewedAt: new Date(),
            reviewedBy: adminUserId,
            reviewNotes,
          },
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        });

        if (!application.teacher) {
          throw new Error("Teacher not found for this application");
        }

        // If approved, update teacher's approval status
        if (status === ApplicationStatus.APPROVED) {
          await tx.teacher.update({
            where: { id: application.teacher.id },
            data: { isApproved: true },
          });

          // Update user role to TEACHER if not already
          await tx.user.update({
            where: { id: application.teacher.userId },
            data: { role: "TEACHER" },
          });
        }

        return application;
      });

      return {
        success: true,
        message: `Teacher application ${status.toLowerCase()} successfully`,
        data: result,
      };
    } catch (error) {
      console.error("Review teacher application error:", error);
      return {
        success: false,
        message: "Failed to review teacher application",
        errors: error,
      };
    }
  }

  /**
   * Get all dynamic options with hierarchy
   */
  static async getDynamicOptions(): Promise<ApiResponse> {
    try {
      const options = await prisma.dynamicOption.findMany({
        orderBy: [{ parentRole: "asc" }, { sortOrder: "asc" }],
        include: {
          parent: true,
          children: {
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
   * Get tutoring categories without authentication
   */
  static async getTutoringCategories(): Promise<ApiResponse> {
    try {
      const categories = await prisma.dynamicOption.findMany({
        where: {
          parentId: null, // Only parent categories
          parentRole: "TUTORING", // Only tutoring categories
          isActive: true, // Only active categories
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
        message: "Tutoring categories retrieved successfully",
        data: categories,
      };
    } catch (error) {
      console.error("Get tutoring categories error:", error);
      return {
        success: false,
        message: "Failed to retrieve tutoring categories",
        errors: error,
      };
    }
  }

  /**
   * Get tutoring subcategories for a specific parent category
   */
  static async getTutoringSubcategories(
    parentId: string
  ): Promise<ApiResponse> {
    try {
      const subcategories = await prisma.dynamicOption.findMany({
        where: {
          parentId: parentId, // Children of the specified parent
          parentRole: "TUTORING", // Only tutoring categories
          isActive: true, // Only active categories
        },
        orderBy: { sortOrder: "asc" },
      });

      return {
        success: true,
        message: "Tutoring subcategories retrieved successfully",
        data: subcategories,
      };
    } catch (error) {
      console.error("Get tutoring subcategories error:", error);
      return {
        success: false,
        message: "Failed to retrieve tutoring subcategories",
        errors: error,
      };
    }
  }

  /**
   * Get children for a specific category (parent option)
   */
  static async getCategoryChildren(
    categoryId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<any>> {
    try {
      const skip = (page - 1) * limit;

      // Verify category exists
      const category = await prisma.dynamicOption.findUnique({
        where: { id: categoryId, parentId: null },
      });

      if (!category) {
        return {
          success: false,
          message: "Category not found",
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }

      const [children, total] = await Promise.all([
        prisma.dynamicOption.findMany({
          where: { parentId: categoryId },
          skip,
          take: limit,
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: {
            parent: true,
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
            _count: {
              select: {
                children: true,
                teacherSelections: true,
                teacherDeepSelections: true,
              },
            },
          },
        }),
        prisma.dynamicOption.count({
          where: { parentId: categoryId },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Category children retrieved successfully",
        data: children,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Get category children error:", error);
      return {
        success: false,
        message: "Failed to retrieve category children",
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  /**
   * Create a child option for a specific category
   */
  static async createCategoryChild(data: {
    categoryId: string;
    name: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ApiResponse> {
    try {
      // Verify parent category exists
      const category = await prisma.dynamicOption.findUnique({
        where: { id: data.categoryId, parentId: null },
      });

      if (!category) {
        return {
          success: false,
          message: "Parent category not found",
        };
      }

      // Check if child with same name already exists under this category
      const existingChild = await prisma.dynamicOption.findFirst({
        where: {
          parentId: data.categoryId,
          name: data.name,
        },
      });

      if (existingChild) {
        return {
          success: false,
          message: "Child with this name already exists under this category",
        };
      }

      // Get the highest sort order for this category if not provided
      let sortOrder = data.sortOrder ?? 0;
      if (!data.sortOrder) {
        const lastChild = await prisma.dynamicOption.findFirst({
          where: { parentId: data.categoryId },
          orderBy: { sortOrder: "desc" },
        });
        sortOrder = (lastChild?.sortOrder ?? 0) + 1;
      }

      const child = await prisma.dynamicOption.create({
        data: {
          parentRole: category.parentRole,
          parentId: data.categoryId,
          name: data.name,
          description: data.description,
          isActive: data.isActive ?? true,
          sortOrder,
        },
        include: {
          parent: true,
          children: {
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: {
              children: true,
              teacherSelections: true,
              teacherDeepSelections: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Child option created successfully",
        data: child,
      };
    } catch (error) {
      console.error("Create category child error:", error);
      return {
        success: false,
        message: "Failed to create child option",
        errors: error,
      };
    }
  }

  /**
   * Update a child option
   */
  static async updateCategoryChild(
    childId: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ): Promise<ApiResponse> {
    try {
      // Verify child exists and is not a parent category
      const child = await prisma.dynamicOption.findUnique({
        where: { id: childId },
        include: { parent: true },
      });

      if (!child) {
        return {
          success: false,
          message: "Child option not found",
        };
      }

      if (!child.parentId) {
        return {
          success: false,
          message: "Cannot update parent category using this endpoint",
        };
      }

      // Check if new name conflicts with existing children (if name is being updated)
      if (data.name && data.name !== child.name) {
        const existingChild = await prisma.dynamicOption.findFirst({
          where: {
            parentId: child.parentId,
            name: data.name,
            id: { not: childId },
          },
        });

        if (existingChild) {
          return {
            success: false,
            message: "Child with this name already exists under this category",
          };
        }
      }

      const updatedChild = await prisma.dynamicOption.update({
        where: { id: childId },
        data,
        include: {
          parent: true,
          children: {
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: {
              children: true,
              teacherSelections: true,
              teacherDeepSelections: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Child option updated successfully",
        data: updatedChild,
      };
    } catch (error) {
      console.error("Update category child error:", error);
      return {
        success: false,
        message: "Failed to update child option",
        errors: error,
      };
    }
  }

  /**
   * Delete a child option
   */
  static async deleteCategoryChild(childId: string): Promise<ApiResponse> {
    try {
      // Verify child exists and is not a parent category
      const child = await prisma.dynamicOption.findUnique({
        where: { id: childId },
        include: {
          parent: true,
          _count: {
            select: {
              children: true,
              teacherSelections: true,
              teacherDeepSelections: true,
            },
          },
        },
      });

      if (!child) {
        return {
          success: false,
          message: "Child option not found",
        };
      }

      if (!child.parentId) {
        return {
          success: false,
          message: "Cannot delete parent category using this endpoint",
        };
      }

      // Check if child has sub-children
      if (child._count.children > 0) {
        return {
          success: false,
          message:
            "Cannot delete child option with sub-children. Please delete sub-children first.",
        };
      }

      // Check if child is being used by teachers
      if (
        child._count.teacherSelections > 0 ||
        child._count.teacherDeepSelections > 0
      ) {
        return {
          success: false,
          message:
            "Cannot delete child option that is currently selected by teachers.",
        };
      }

      await prisma.dynamicOption.delete({
        where: { id: childId },
      });

      return {
        success: true,
        message: "Child option deleted successfully",
      };
    } catch (error) {
      console.error("Delete category child error:", error);
      return {
        success: false,
        message: "Failed to delete child option",
        errors: error,
      };
    }
  }

  /**
   * Get all distinct parent roles from database
   */
  static async getParentRoles(): Promise<ApiResponse> {
    try {
      const parentRoles = await prisma.dynamicOption.findMany({
        where: {
          // parentRole is now required, so we don't need to filter out null values
        },
        select: {
          parentRole: true,
        },
        distinct: ["parentRole"],
        orderBy: {
          parentRole: "asc",
        },
      });

      const roles = parentRoles.map((item) => item.parentRole) as TeacherRole[];

      return {
        success: true,
        message: "Parent roles retrieved successfully",
        data: roles,
      };
    } catch (error) {
      console.error("Get parent roles error:", error);
      return {
        success: false,
        message: "Failed to retrieve parent roles",
        errors: error,
      };
    }
  }

  /**
   * Create a new dynamic option
   */
  static async createDynamicOption(data: {
    parentRole: TeacherRole; // Now required
    parentId?: string;
    name: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ApiResponse> {
    try {
      // Validate parent option exists if parentId is provided
      if (data.parentId) {
        const parentOption = await prisma.dynamicOption.findUnique({
          where: { id: data.parentId },
        });

        if (!parentOption) {
          return {
            success: false,
            message: "Parent option not found",
          };
        }
      }

      const option = await prisma.dynamicOption.create({
        data: {
          parentRole: data.parentRole,
          parentId: data.parentId,
          name: data.name,
          description: data.description,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
        include: {
          parent: true,
          children: true,
        },
      });

      return {
        success: true,
        message: "Dynamic option created successfully",
        data: option,
      };
    } catch (error) {
      console.error("Create dynamic option error:", error);
      return {
        success: false,
        message: "Failed to create dynamic option",
        errors: error,
      };
    }
  }

  /**
   * Update a dynamic option
   */
  static async updateDynamicOption(
    optionId: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ): Promise<ApiResponse> {
    try {
      const option = await prisma.dynamicOption.update({
        where: { id: optionId },
        data,
        include: {
          parent: true,
          children: true,
        },
      });

      return {
        success: true,
        message: "Dynamic option updated successfully",
        data: option,
      };
    } catch (error) {
      console.error("Update dynamic option error:", error);
      return {
        success: false,
        message: "Failed to update dynamic option",
        errors: error,
      };
    }
  }

  /**
   * Delete a dynamic option
   */
  static async deleteDynamicOption(optionId: string): Promise<ApiResponse> {
    try {
      // Check if option has children
      const childrenCount = await prisma.dynamicOption.count({
        where: { parentId: optionId },
      });

      if (childrenCount > 0) {
        return {
          success: false,
          message:
            "Cannot delete option with child options. Please delete child options first.",
        };
      }

      // Check if option is being used by teachers
      const [subOptionUsage, deepOptionUsage] = await Promise.all([
        prisma.teacherSubOptionSelection.count({
          where: { optionId },
        }),
        prisma.teacherDeepOptionSelection.count({
          where: { optionId },
        }),
      ]);

      if (subOptionUsage > 0 || deepOptionUsage > 0) {
        return {
          success: false,
          message:
            "Cannot delete option that is currently selected by teachers. Please deactivate instead.",
        };
      }

      await prisma.dynamicOption.delete({
        where: { id: optionId },
      });

      return {
        success: true,
        message: "Dynamic option deleted successfully",
      };
    } catch (error) {
      console.error("Delete dynamic option error:", error);
      return {
        success: false,
        message: "Failed to delete dynamic option",
        errors: error,
      };
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<ApiResponse> {
    try {
      const [
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalTeachers,
        totalStudents,
        totalDynamicOptions,
      ] = await Promise.all([
        prisma.teacherApplication.count(),
        prisma.teacherApplication.count({
          where: { status: ApplicationStatus.PENDING },
        }),
        prisma.teacherApplication.count({
          where: { status: ApplicationStatus.APPROVED },
        }),
        prisma.teacherApplication.count({
          where: { status: ApplicationStatus.REJECTED },
        }),
        prisma.teacher.count({ where: { isApproved: true } }),
        prisma.student.count(),
        prisma.dynamicOption.count({ where: { isActive: true } }),
      ]);

      return {
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: {
          applications: {
            total: totalApplications,
            pending: pendingApplications,
            approved: approvedApplications,
            rejected: rejectedApplications,
          },
          users: {
            teachers: totalTeachers,
            students: totalStudents,
          },
          dynamicOptions: totalDynamicOptions,
        },
      };
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return {
        success: false,
        message: "Failed to retrieve dashboard statistics",
        errors: error,
      };
    }
  }

  /**
   * Get student form responses analytics
   */
  static async getStudentFormAnalytics(): Promise<ApiResponse<any>> {
    try {
      // Get form completion statistics
      const [totalStudents, completedForms, formResponses] = await Promise.all([
        prisma.student.count(),
        prisma.student.count({ where: { isFormCompleted: true } }),
        prisma.studentFormResponse.findMany({
          where: { isCompleted: true },
          select: {
            studentType: true,
            inclusiveLearning: true,
            curriculum: true,
            grade: true,
            preferredTime: true,
            preferredTutor: true,
            sessionType: true,
            selectedCategories: true,
            selectedSubcategories: true,
          },
        }),
      ]);

      // Analyze form responses
      const analytics = {
        completion: {
          total: totalStudents,
          completed: completedForms,
          pending: totalStudents - completedForms,
          completionRate:
            totalStudents > 0
              ? ((completedForms / totalStudents) * 100).toFixed(2)
              : 0,
        },
        demographics: {
          studentType: this.countValues(formResponses, "studentType"),
          inclusiveLearning: this.countValues(
            formResponses,
            "inclusiveLearning"
          ),
          curriculum: this.countValues(formResponses, "curriculum"),
          grade: this.countValues(formResponses, "grade"),
        },
        preferences: {
          preferredTime: this.countValues(formResponses, "preferredTime"),
          preferredTutor: this.countValues(formResponses, "preferredTutor"),
          sessionType: this.countValues(formResponses, "sessionType"),
        },
        categorySelection: await this.analyzeCategorySelections(formResponses),
      };

      return {
        success: true,
        message: "Student form analytics retrieved successfully",
        data: analytics,
      };
    } catch (error) {
      console.error("Get student form analytics error:", error);
      return {
        success: false,
        message: "Failed to retrieve student form analytics",
        errors: error,
      };
    }
  }

  /**
   * Helper method to count values in array of objects
   */
  private static countValues(
    data: any[],
    field: string
  ): Record<string, number> {
    const counts: Record<string, number> = {};

    data.forEach((item) => {
      const value = item[field];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return counts;
  }

  /**
   * Helper method to analyze category and subcategory selections
   */
  private static async analyzeCategorySelections(
    formResponses: any[]
  ): Promise<any> {
    try {
      const categoryCounts: Record<string, number> = {};
      const subcategoryCounts: Record<string, number> = {};
      const categoryNames: Record<string, string> = {};
      const subcategoryNames: Record<string, string> = {};

      // Count category and subcategory selections
      for (const response of formResponses) {
        if (response.selectedCategories) {
          const categories = JSON.parse(response.selectedCategories);
          categories.forEach((categoryId: string) => {
            categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
          });
        }
        if (response.selectedSubcategories) {
          const subcategories = JSON.parse(response.selectedSubcategories);
          subcategories.forEach((subcategoryId: string) => {
            subcategoryCounts[subcategoryId] =
              (subcategoryCounts[subcategoryId] || 0) + 1;
          });
        }
      }

      // Get category names
      const categoryIds = Object.keys(categoryCounts);
      if (categoryIds.length > 0) {
        const categories = await prisma.dynamicOption.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        });

        categories.forEach((category) => {
          categoryNames[category.id] = category.name;
        });
      }

      // Get subcategory names
      const subcategoryIds = Object.keys(subcategoryCounts);
      if (subcategoryIds.length > 0) {
        const subcategories = await prisma.dynamicOption.findMany({
          where: { id: { in: subcategoryIds } },
          select: { id: true, name: true },
        });

        subcategories.forEach((subcategory) => {
          subcategoryNames[subcategory.id] = subcategory.name;
        });
      }

      // Format results
      const topCategories = Object.entries(categoryCounts)
        .map(([id, count]) => ({
          id,
          name: categoryNames[id] || "Unknown Category",
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 categories

      const topSubcategories = Object.entries(subcategoryCounts)
        .map(([id, count]) => ({
          id,
          name: subcategoryNames[id] || "Unknown Subcategory",
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 subcategories

      return {
        totalCategorySelections: Object.values(categoryCounts).reduce(
          (sum, count) => sum + count,
          0
        ),
        totalSubcategorySelections: Object.values(subcategoryCounts).reduce(
          (sum, count) => sum + count,
          0
        ),
        uniqueCategories: Object.keys(categoryCounts).length,
        uniqueSubcategories: Object.keys(subcategoryCounts).length,
        topCategories,
        topSubcategories,
      };
    } catch (error) {
      console.error("Analyze category selections error:", error);
      return {
        totalCategorySelections: 0,
        totalSubcategorySelections: 0,
        uniqueCategories: 0,
        uniqueSubcategories: 0,
        topCategories: [],
        topSubcategories: [],
      };
    }
  }

  /**
   * Get order analytics and statistics
   */
  static async getOrderAnalytics(): Promise<ApiResponse<any>> {
    try {
      // Get order statistics
      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
        rejectedOrders,
        recentOrders,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "CONFIRMED" } }),
        prisma.order.count({ where: { status: "IN_PROGRESS" } }),
        prisma.order.count({ where: { status: "COMPLETED" } }),
        prisma.order.count({ where: { status: "CANCELLED" } }),
        prisma.order.count({ where: { status: "REJECTED" } }),
        prisma.order.findMany({
          take: 10,
          include: {
            student: {
              select: { fullName: true, user: { select: { email: true } } },
            },
            teacher: {
              select: { fullName: true, user: { select: { email: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      // Calculate completion rate
      const completionRate =
        totalOrders > 0
          ? ((completedOrders / totalOrders) * 100).toFixed(2)
          : 0;

      // Get revenue statistics (completed orders only)
      const revenueData = await prisma.order.aggregate({
        where: { status: "COMPLETED", agreedRate: { not: null } },
        _sum: { totalAmount: true },
        _avg: { agreedRate: true },
        _count: { id: true },
      });

      // Get popular subjects and grades
      const [subjectStats, gradeStats, curriculumStats] = await Promise.all([
        prisma.order.groupBy({
          by: ["subject"],
          _count: { subject: true },
          orderBy: { _count: { subject: "desc" } },
          take: 10,
        }),
        prisma.order.groupBy({
          by: ["grade"],
          _count: { grade: true },
          orderBy: { _count: { grade: "desc" } },
        }),
        prisma.order.groupBy({
          by: ["curriculum"],
          _count: { curriculum: true },
          orderBy: { _count: { curriculum: "desc" } },
        }),
      ]);

      // Get monthly order trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyTrends = await prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: { gte: sixMonthsAgo },
        },
        _count: { id: true },
      });

      // Process monthly trends
      const monthlyData = this.processMonthlyTrends(monthlyTrends);

      const analytics = {
        overview: {
          totalOrders,
          completionRate: `${completionRate}%`,
          revenue: {
            total: revenueData._sum.totalAmount || 0,
            averageRate: revenueData._avg.agreedRate || 0,
            completedOrders: revenueData._count || 0,
          },
        },
        statusBreakdown: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          inProgress: inProgressOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          rejected: rejectedOrders,
        },
        trends: {
          monthly: monthlyData,
        },
        popular: {
          subjects: subjectStats.map((s) => ({
            subject: s.subject,
            count: s._count.subject,
          })),
          grades: gradeStats.map((g) => ({
            grade: g.grade,
            count: g._count.grade,
          })),
          curricula: curriculumStats.map((c) => ({
            curriculum: c.curriculum,
            count: c._count.curriculum,
          })),
        },
        recentOrders,
      };

      return {
        success: true,
        message: "Order analytics retrieved successfully",
        data: analytics,
      };
    } catch (error) {
      console.error("Get order analytics error:", error);
      return {
        success: false,
        message: "Failed to retrieve order analytics",
        errors: error,
      };
    }
  }

  /**
   * Helper method to process monthly trends
   */
  private static processMonthlyTrends(trends: any[]): any[] {
    const monthlyMap = new Map();

    trends.forEach((trend) => {
      const date = new Date(trend.createdAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, monthlyMap.get(monthKey) + trend._count.id);
      } else {
        monthlyMap.set(monthKey, trend._count.id);
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([month, count]) => ({
        month,
        orders: count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
