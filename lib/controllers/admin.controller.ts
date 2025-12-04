import { Request, Response } from "express";
import { ApplicationStatus, TeacherRole } from "@prisma/client";
import { AdminService } from "../services/admin.service";
import { StudentService } from "../services/student.service";
import { OrderService } from "../services/order.service";
import { CourseService } from "../services/course.service";
import {
  createDynamicOptionSchema,
  updateDynamicOptionSchema,
  createCategoryChildSchema,
  updateCategoryChildSchema,
  reviewTeacherApplicationSchema,
  paginationSchema,
  teacherApplicationFilterSchema,
} from "../validation/admin";
import { ApiResponse, AuthenticatedRequest, PaginatedResponse } from "../types";

export class AdminController {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const result = await AdminService.getDashboardStats();

      res.status(200).json(result);
    } catch (error) {
      console.error("Get dashboard stats controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all teacher applications with pagination and filtering
   */
  static async getTeacherApplications(
    req: AuthenticatedRequest,
    res: Response<PaginatedResponse<any>>
  ): Promise<void> {
    try {
      // Validate pagination parameters
      const { error: paginationError, value: paginationValue } =
        paginationSchema.validate({
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
        });

      if (paginationError) {
        res.status(400).json({
          success: false,
          message: "Invalid pagination parameters",
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
        return;
      }

      // Validate filter parameters
      const filterData = {
        status: req.query.status as ApplicationStatus | undefined,
        role: req.query.role as TeacherRole | undefined,
        dateFrom: req.query.dateFrom
          ? new Date(req.query.dateFrom as string)
          : undefined,
        dateTo: req.query.dateTo
          ? new Date(req.query.dateTo as string)
          : undefined,
      };

      const { error: filterError, value: filterValue } =
        teacherApplicationFilterSchema.validate(filterData);

      if (filterError) {
        res.status(400).json({
          success: false,
          message: "Invalid filter parameters",
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
        return;
      }

      const result = await AdminService.getTeacherApplications(
        paginationValue.page,
        paginationValue.limit,
        filterValue
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Get teacher applications controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }
  }

  /**
   * Get a specific teacher application by ID
   */
  static async getTeacherApplication(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { applicationId } = req.params;

      if (!applicationId) {
        res.status(400).json({
          success: false,
          message: "Application ID is required",
        });
        return;
      }

      const result = await AdminService.getTeacherApplication(applicationId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Get teacher application controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Review teacher application (approve or reject)
   */
  static async reviewTeacherApplication(
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

      const { applicationId } = req.params;

      if (!applicationId) {
        res.status(400).json({
          success: false,
          message: "Application ID is required",
        });
        return;
      }

      // Validate request body
      const { error, value } = reviewTeacherApplicationSchema.validate(
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

      const result = await AdminService.reviewTeacherApplication(
        applicationId,
        req.user.id,
        value.status,
        value.reviewNotes
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Review teacher application controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all dynamic options
   */
  static async getDynamicOptions(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const result = await AdminService.getDynamicOptions();

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
   * Create a new dynamic option
   */
  static async createDynamicOption(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createDynamicOptionSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await AdminService.createDynamicOption(value);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Create dynamic option controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update a dynamic option
   */
  static async updateDynamicOption(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { optionId } = req.params;

      if (!optionId) {
        res.status(400).json({
          success: false,
          message: "Option ID is required",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateDynamicOptionSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await AdminService.updateDynamicOption(optionId, value);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Update dynamic option controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Delete a dynamic option
   */
  static async deleteDynamicOption(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { optionId } = req.params;

      if (!optionId) {
        res.status(400).json({
          success: false,
          message: "Option ID is required",
        });
        return;
      }

      const result = await AdminService.deleteDynamicOption(optionId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Delete dynamic option controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Student Management Methods

  /**
   * Get all students with pagination
   */
  static async getAllStudents(
    req: AuthenticatedRequest,
    res: Response<PaginatedResponse<any>>
  ): Promise<void> {
    try {
      // Validate pagination parameters
      const { error: paginationError, value: paginationValue } =
        paginationSchema.validate({
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
        });

      if (paginationError) {
        res.status(400).json({
          success: false,
          message: "Invalid pagination parameters",
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
        return;
      }

      const studentService = new StudentService();
      const result = await studentService.getAllStudents(
        paginationValue.page,
        paginationValue.limit
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data.students,
          pagination: result.data.pagination,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }
    } catch (error) {
      console.error("Get all students controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }
  }

  /**
   * Get a specific student by ID
   */
  static async getStudentById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        res.status(400).json({
          success: false,
          message: "Student ID is required",
        });
        return;
      }

      const studentService = new StudentService();
      const result = await studentService.getStudentProfile(studentId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Get student by ID controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get student form responses summary for analytics
   */
  static async getStudentFormAnalytics(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const result = await AdminService.getStudentFormAnalytics();

      res.status(200).json(result);
    } catch (error) {
      console.error("Get student form analytics controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Order Management Methods

  /**
   * Get all orders with pagination and filters
   */
  static async getAllOrders(
    req: AuthenticatedRequest,
    res: Response<PaginatedResponse<any>>
  ): Promise<void> {
    try {
      // Validate pagination parameters
      const { error: paginationError, value: paginationValue } =
        paginationSchema.validate({
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
        });

      if (paginationError) {
        res.status(400).json({
          success: false,
          message: "Invalid pagination parameters",
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
        return;
      }

      const orderService = new OrderService();
      const result = await orderService.getAllOrders(
        paginationValue.page,
        paginationValue.limit,
        req.query
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          pagination: result.pagination,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }
    } catch (error) {
      console.error("Get all orders controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }
  }

  /**
   * Get specific order by ID
   */
  static async getOrderById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const orderService = new OrderService();
      const result = await orderService.getOrderById(orderId, req.user.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Get order by ID controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update order status (Admin)
   */
  static async updateOrderStatus(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const orderService = new OrderService();
      const result = await orderService.updateOrderStatus(
        orderId,
        req.user.id,
        req.body
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Update order status controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get order analytics and statistics
   */
  static async getOrderAnalytics(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const result = await AdminService.getOrderAnalytics();

      res.status(200).json(result);
    } catch (error) {
      console.error("Get order analytics controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get children for a specific category
   */
  static async getCategoryChildren(
    req: AuthenticatedRequest,
    res: Response<PaginatedResponse<any>>
  ): Promise<void> {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        res.status(400).json({
          success: false,
          message: "Category ID is required",
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
        return;
      }

      // Validate pagination parameters
      const { error: paginationError, value: paginationValue } =
        paginationSchema.validate({
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
        });

      if (paginationError) {
        res.status(400).json({
          success: false,
          message: "Invalid pagination parameters",
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
        return;
      }

      const result = await AdminService.getCategoryChildren(
        categoryId,
        paginationValue.page,
        paginationValue.limit
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Get category children controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }
  }

  /**
   * Create a child option for a category
   */
  static async createCategoryChild(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
        return;
      }

      // Validate request body
      const { error, value } = createCategoryChildSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await AdminService.createCategoryChild({
        categoryId,
        name: value.name,
        description: value.description,
        isActive: value.isActive,
        sortOrder: value.sortOrder,
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Create category child controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update a child option
   */
  static async updateCategoryChild(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { childId } = req.params;

      if (!childId) {
        res.status(400).json({
          success: false,
          message: "Child ID is required",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateCategoryChildSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await AdminService.updateCategoryChild(childId, value);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Update category child controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Delete a child option
   */
  static async deleteCategoryChild(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { childId } = req.params;

      if (!childId) {
        res.status(400).json({
          success: false,
          message: "Child ID is required",
        });
        return;
      }

      const result = await AdminService.deleteCategoryChild(childId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Delete category child controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all distinct parent roles
   */
  static async getParentRoles(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const result = await AdminService.getParentRoles();
      res.status(200).json(result);
    } catch (error) {
      console.error("Get parent roles controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all courses (admin)
   */
  static async getAllCourses(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const filters = {
        status: req.query.status as any,
        teacherId: req.query.teacherId as string,
        search: req.query.search as string,
      };

      const result = await CourseService.getAllCourses(filters);

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
   * Get course by ID (admin)
   */
  static async getCourseById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const courseId = req.params.courseId;

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
   * Approve course (admin)
   */
  static async approveCourse(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const courseId = req.params.courseId;

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
   * Reject course (admin)
   */
  static async rejectCourse(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const courseId = req.params.courseId;

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
