import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { StudentService } from "../services/student.service";
import { AuthenticatedRequest } from "../types";
import {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  addOrderMessageSchema,
  orderFilterSchema,
  paginationSchema,
  teacherOrderResponseSchema,
} from "../validation/order";

const orderService = new OrderService();
const studentService = new StudentService();

export class OrderController {
  /**
   * Create a new order (Student only)
   * POST /api/orders
   */
  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== "STUDENT") {
        res.status(403).json({
          success: false,
          message: "Only students can create orders",
        });
        return;
      }

      // Validate request body
      const { error, value } = createOrderSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      // Get student ID
      const studentResult = await studentService.getOrCreateStudentByUserId(
        req.user.id
      );
      if (!studentResult.success || !studentResult.data) {
        res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
        return;
      }

      const result = await orderService.createOrder(
        studentResult.data.id,
        value
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get student's orders
   * GET /api/orders/student
   */
  async getStudentOrders(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || req.user.role !== "STUDENT") {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      // Validate pagination
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
        });
        return;
      }

      // Validate filters
      const { error: filterError, value: filterValue } =
        orderFilterSchema.validate(req.query);
      if (filterError) {
        res.status(400).json({
          success: false,
          message: "Invalid filter parameters",
        });
        return;
      }

      // Get student ID
      const studentResult = await studentService.getOrCreateStudentByUserId(
        req.user.id
      );
      if (!studentResult.success || !studentResult.data) {
        res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
        return;
      }

      const result = await orderService.getStudentOrders(
        studentResult.data.id,
        paginationValue.page,
        paginationValue.limit,
        filterValue
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Get student orders error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get teacher's orders
   * GET /api/orders/teacher
   */
  async getTeacherOrders(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || req.user.role !== "TEACHER") {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      // Validate pagination
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
        });
        return;
      }

      // Validate filters
      const { error: filterError, value: filterValue } =
        orderFilterSchema.validate(req.query);
      if (filterError) {
        res.status(400).json({
          success: false,
          message: "Invalid filter parameters",
        });
        return;
      }

      // Get teacher ID from user ID
      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: "Teacher profile not found",
        });
        return;
      }

      const result = await orderService.getTeacherOrders(
        teacher.id,
        paginationValue.page,
        paginationValue.limit,
        filterValue
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Get teacher orders error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:orderId
   */
  async getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { orderId } = req.params;

      const result = await orderService.getOrderById(orderId, req.user.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.message === "Order not found" ? 404 : 403;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      console.error("Get order by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update order (Student only, PENDING orders only)
   * PUT /api/orders/:orderId
   */
  async updateOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== "STUDENT") {
        res.status(403).json({
          success: false,
          message: "Only students can update orders",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateOrderSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const { orderId } = req.params;

      // Get student ID
      const studentResult = await studentService.getOrCreateStudentByUserId(
        req.user.id
      );
      if (!studentResult.success || !studentResult.data) {
        res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
        return;
      }

      const result = await orderService.updateOrder(
        orderId,
        studentResult.data.id,
        value
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Update order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update order status (Teacher/Admin)
   * PUT /api/orders/:orderId/status
   */
  async updateOrderStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || !["TEACHER", "ADMIN"].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateOrderStatusSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const { orderId } = req.params;

      const result = await orderService.updateOrderStatus(
        orderId,
        req.user.id,
        value
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Add message to order
   * POST /api/orders/:orderId/messages
   */
  async addOrderMessage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // Validate request body
      const { error, value } = addOrderMessageSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const { orderId } = req.params;

      const result = await orderService.addOrderMessage(
        orderId,
        req.user.id,
        value
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Add order message error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Cancel order (Student only)
   * POST /api/orders/:orderId/cancel
   */
  async cancelOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== "STUDENT") {
        res.status(403).json({
          success: false,
          message: "Only students can cancel orders",
        });
        return;
      }

      const { orderId } = req.params;
      const { reason } = req.body;

      // Get student ID
      const studentResult = await studentService.getOrCreateStudentByUserId(
        req.user.id
      );
      if (!studentResult.success || !studentResult.data) {
        res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
        return;
      }

      const result = await orderService.cancelOrder(
        orderId,
        studentResult.data.id,
        reason
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all orders (Admin only)
   * GET /api/orders/admin/all
   */
  async getAllOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        });
        return;
      }

      // Validate pagination
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
        });
        return;
      }

      // Validate filters
      const { error: filterError, value: filterValue } =
        orderFilterSchema.validate(req.query);
      if (filterError) {
        res.status(400).json({
          success: false,
          message: "Invalid filter parameters",
        });
        return;
      }

      const result = await orderService.getAllOrders(
        paginationValue.page,
        paginationValue.limit,
        filterValue
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Teacher response to order (accept/reject/negotiate)
   * POST /api/orders/:orderId/respond
   */
  async teacherOrderResponse(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || req.user.role !== "TEACHER") {
        res.status(403).json({
          success: false,
          message: "Teacher access required",
        });
        return;
      }

      // Validate request body
      const { error, value } = teacherOrderResponseSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const { orderId } = req.params;
      const { response, message, counterRate, availableStartDate } = value;

      // Determine new status based on response
      let newStatus = "PENDING";
      let statusData: any = {
        changeReason: `Teacher ${response.toLowerCase()}ed the order`,
      };

      switch (response) {
        case "ACCEPT":
          newStatus = "CONFIRMED";
          if (availableStartDate) {
            statusData.actualStartDate = availableStartDate;
          }
          break;
        case "REJECT":
          newStatus = "REJECTED";
          break;
        case "NEGOTIATE":
          newStatus = "PENDING";
          statusData.agreedRate = counterRate;
          statusData.changeReason = "Teacher proposed a counter rate";
          break;
      }

      statusData.status = newStatus;
      if (message) {
        statusData.teacherNotes = message;
      }

      const result = await orderService.updateOrderStatus(
        orderId,
        req.user.id,
        statusData
      );

      if (result.success) {
        // Add message if provided
        if (message) {
          await orderService.addOrderMessage(orderId, req.user.id, { message });
        }

        res.status(200).json({
          success: true,
          message: `Order ${response.toLowerCase()}ed successfully`,
          data: result.data,
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Teacher order response error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

// Import prisma for teacher lookup
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
