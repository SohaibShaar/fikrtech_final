import {
  PrismaClient,
  Order,
  OrderStatus,
  OrderPriority,
} from "@prisma/client";
import { ApiResponse, PaginatedResponse } from "../types";

const prisma = new PrismaClient();

export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(
    studentId: string,
    orderData: any
  ): Promise<ApiResponse<Order>> {
    try {
      // Verify student exists and form is completed
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { isFormCompleted: true },
      });

      if (!student) {
        return {
          success: false,
          message: "Student not found",
        };
      }

      if (!student.isFormCompleted) {
        return {
          success: false,
          message: "Please complete your profile form before creating orders",
        };
      }

      // Verify teacher exists and is approved
      const teacher = await prisma.teacher.findUnique({
        where: { id: orderData.teacherId },
        select: { isApproved: true },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher not found",
        };
      }

      if (!teacher.isApproved) {
        return {
          success: false,
          message: "Selected teacher is not approved yet",
        };
      }

      // Calculate total amount if rate and sessions are provided
      let totalAmount = null;
      if (
        orderData.proposedRate &&
        orderData.totalSessions &&
        orderData.sessionDuration
      ) {
        const hours =
          (orderData.sessionDuration / 60) * orderData.totalSessions;
        totalAmount = orderData.proposedRate * hours;
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          studentId,
          teacherId: orderData.teacherId,
          title: orderData.title,
          description: orderData.description,
          subject: orderData.subject,
          grade: orderData.grade,
          curriculum: orderData.curriculum,
          sessionType: orderData.sessionType,
          preferredTime: orderData.preferredTime,
          sessionsPerWeek: orderData.sessionsPerWeek || 1,
          sessionDuration: orderData.sessionDuration || 60,
          totalSessions: orderData.totalSessions,
          location: orderData.location,
          address: orderData.address,
          proposedRate: orderData.proposedRate,
          totalAmount,
          priority: orderData.priority || "MEDIUM",
          preferredStartDate: orderData.preferredStartDate
            ? new Date(orderData.preferredStartDate)
            : null,
          requirements: orderData.requirements,
          specialNeeds: orderData.specialNeeds,
          studentNotes: orderData.studentNotes,
        },
        include: {
          student: {
            select: {
              fullName: true,
              user: { select: { email: true } },
            },
          },
          teacher: {
            select: {
              fullName: true,
              user: { select: { email: true } },
            },
          },
        },
      });

      // Create order history entry
      await prisma.orderHistory.create({
        data: {
          orderId: order.id,
          newStatus: "PENDING",
          changedBy: studentId,
          changeReason: "Order created",
        },
      });

      return {
        success: true,
        message: "Order created successfully",
        data: order,
      };
    } catch (error) {
      console.error("Create order error:", error);
      return {
        success: false,
        message: "Failed to create order",
        errors: error,
      };
    }
  }

  /**
   * Get orders for a student
   */
  async getStudentOrders(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<PaginatedResponse<Order>> {
    try {
      const skip = (page - 1) * limit;

      const where: any = { studentId };

      // Apply filters
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.grade) where.grade = filters.grade;
      if (filters.curriculum) where.curriculum = filters.curriculum;
      if (filters.sessionType) where.sessionType = filters.sessionType;
      if (filters.subject)
        where.subject = { contains: filters.subject, mode: "insensitive" };

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          include: {
            teacher: {
              select: {
                fullName: true,
                profilePhoto: true,
                user: { select: { email: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({ where }),
      ]);

      return {
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Get student orders error:", error);
      return {
        success: false,
        message: "Failed to get orders",
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
   * Get orders for a teacher
   */
  async getTeacherOrders(
    teacherId: string,
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<PaginatedResponse<Order>> {
    try {
      const skip = (page - 1) * limit;

      const where: any = { teacherId };

      // Apply filters
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.grade) where.grade = filters.grade;
      if (filters.curriculum) where.curriculum = filters.curriculum;
      if (filters.sessionType) where.sessionType = filters.sessionType;
      if (filters.subject)
        where.subject = { contains: filters.subject, mode: "insensitive" };

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          include: {
            student: {
              select: {
                fullName: true,
                user: { select: { email: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({ where }),
      ]);

      return {
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Get teacher orders error:", error);
      return {
        success: false,
        message: "Failed to get orders",
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
   * Get order by ID
   */
  async getOrderById(
    orderId: string,
    userId: string
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              user: { select: { id: true, email: true } },
            },
          },
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              user: { select: { id: true, email: true } },
            },
          },
          orderHistory: {
            orderBy: { createdAt: "desc" },
          },
          orderMessages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      // Check if user has permission to view this order
      const hasPermission =
        order.student.user.id === userId ||
        order.teacher.user.id === userId ||
        (await this.isAdmin(userId));

      if (!hasPermission) {
        return {
          success: false,
          message: "Access denied",
        };
      }

      return {
        success: true,
        message: "Order retrieved successfully",
        data: order,
      };
    } catch (error) {
      console.error("Get order by ID error:", error);
      return {
        success: false,
        message: "Failed to get order",
        errors: error,
      };
    }
  }

  /**
   * Update order (student only, and only if status is PENDING)
   */
  async updateOrder(
    orderId: string,
    studentId: string,
    updateData: any
  ): Promise<ApiResponse<Order>> {
    try {
      // Check if order exists and belongs to student
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { studentId: true, status: true },
      });

      if (!existingOrder) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      if (existingOrder.studentId !== studentId) {
        return {
          success: false,
          message: "Access denied",
        };
      }

      if (existingOrder.status !== "PENDING") {
        return {
          success: false,
          message: "Order can only be updated when status is PENDING",
        };
      }

      // Calculate total amount if rate and sessions are updated
      if (
        updateData.proposedRate ||
        updateData.totalSessions ||
        updateData.sessionDuration
      ) {
        const currentOrder = await prisma.order.findUnique({
          where: { id: orderId },
          select: {
            proposedRate: true,
            totalSessions: true,
            sessionDuration: true,
          },
        });

        const rate = updateData.proposedRate || currentOrder?.proposedRate;
        const sessions =
          updateData.totalSessions || currentOrder?.totalSessions;
        const duration =
          updateData.sessionDuration || currentOrder?.sessionDuration;

        if (rate && sessions && duration) {
          const hours = (duration / 60) * sessions;
          updateData.totalAmount = rate * hours;
        }
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          student: {
            select: {
              fullName: true,
              user: { select: { email: true } },
            },
          },
          teacher: {
            select: {
              fullName: true,
              user: { select: { email: true } },
            },
          },
        },
      });

      return {
        success: true,
        message: "Order updated successfully",
        data: order,
      };
    } catch (error) {
      console.error("Update order error:", error);
      return {
        success: false,
        message: "Failed to update order",
        errors: error,
      };
    }
  }

  /**
   * Update order status (teacher/admin)
   */
  async updateOrderStatus(
    orderId: string,
    userId: string,
    statusData: any
  ): Promise<ApiResponse<Order>> {
    try {
      // Get order and check permissions
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          teacher: { select: { user: { select: { id: true } } } },
        },
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      const isTeacher = order.teacher.user.id === userId;
      const isAdmin = await this.isAdmin(userId);

      if (!isTeacher && !isAdmin) {
        return {
          success: false,
          message: "Access denied",
        };
      }

      // Validate status transition
      const validTransitions = this.getValidStatusTransitions(order.status);
      if (!validTransitions.includes(statusData.status)) {
        return {
          success: false,
          message: `Cannot change status from ${order.status} to ${statusData.status}`,
        };
      }

      // Update order in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update order
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: statusData.status,
            teacherNotes: statusData.teacherNotes,
            adminNotes: statusData.adminNotes,
            agreedRate: statusData.agreedRate,
            actualStartDate: statusData.actualStartDate
              ? new Date(statusData.actualStartDate)
              : undefined,
            estimatedEndDate: statusData.estimatedEndDate
              ? new Date(statusData.estimatedEndDate)
              : undefined,
          },
          include: {
            student: {
              select: {
                fullName: true,
                user: { select: { email: true } },
              },
            },
            teacher: {
              select: {
                fullName: true,
                user: { select: { email: true } },
              },
            },
          },
        });

        // Create history entry
        await tx.orderHistory.create({
          data: {
            orderId,
            previousStatus: order.status,
            newStatus: statusData.status,
            changedBy: userId,
            changeReason: statusData.changeReason,
          },
        });

        return updatedOrder;
      });

      return {
        success: true,
        message: "Order status updated successfully",
        data: result,
      };
    } catch (error) {
      console.error("Update order status error:", error);
      return {
        success: false,
        message: "Failed to update order status",
        errors: error,
      };
    }
  }

  /**
   * Add message to order
   */
  async addOrderMessage(
    orderId: string,
    userId: string,
    messageData: any
  ): Promise<ApiResponse<any>> {
    try {
      // Check if user has access to this order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          student: { select: { user: { select: { id: true } } } },
          teacher: { select: { user: { select: { id: true } } } },
        },
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      const isStudent = order.student.user.id === userId;
      const isTeacher = order.teacher.user.id === userId;
      const isAdmin = await this.isAdmin(userId);

      if (!isStudent && !isTeacher && !isAdmin) {
        return {
          success: false,
          message: "Access denied",
        };
      }

      // Determine sender role
      let senderRole: "ADMIN" | "STUDENT" | "TEACHER" = "ADMIN";
      if (isStudent) senderRole = "STUDENT";
      else if (isTeacher) senderRole = "TEACHER";

      const message = await prisma.orderMessage.create({
        data: {
          orderId,
          senderId: userId,
          senderRole,
          message: messageData.message,
          attachments: messageData.attachments
            ? JSON.stringify(messageData.attachments)
            : null,
        },
      });

      return {
        success: true,
        message: "Message added successfully",
        data: message,
      };
    } catch (error) {
      console.error("Add order message error:", error);
      return {
        success: false,
        message: "Failed to add message",
        errors: error,
      };
    }
  }

  /**
   * Cancel order (student only)
   */
  async cancelOrder(
    orderId: string,
    studentId: string,
    reason?: string
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { studentId: true, status: true },
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      if (order.studentId !== studentId) {
        return {
          success: false,
          message: "Access denied",
        };
      }

      if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        return {
          success: false,
          message: "Order cannot be cancelled in current status",
        };
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });

        await tx.orderHistory.create({
          data: {
            orderId,
            previousStatus: order.status,
            newStatus: "CANCELLED",
            changedBy: studentId,
            changeReason: reason || "Cancelled by student",
          },
        });

        return updatedOrder;
      });

      return {
        success: true,
        message: "Order cancelled successfully",
        data: result,
      };
    } catch (error) {
      console.error("Cancel order error:", error);
      return {
        success: false,
        message: "Failed to cancel order",
        errors: error,
      };
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<PaginatedResponse<Order>> {
    try {
      const skip = (page - 1) * limit;

      const where: any = {};

      // Apply filters
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.grade) where.grade = filters.grade;
      if (filters.curriculum) where.curriculum = filters.curriculum;
      if (filters.sessionType) where.sessionType = filters.sessionType;
      if (filters.subject)
        where.subject = { contains: filters.subject, mode: "insensitive" };

      if (filters.minRate || filters.maxRate) {
        where.proposedRate = {};
        if (filters.minRate)
          where.proposedRate.gte = parseFloat(filters.minRate);
        if (filters.maxRate)
          where.proposedRate.lte = parseFloat(filters.maxRate);
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          include: {
            student: {
              select: {
                fullName: true,
                user: { select: { email: true } },
              },
            },
            teacher: {
              select: {
                fullName: true,
                user: { select: { email: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({ where }),
      ]);

      return {
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Get all orders error:", error);
      return {
        success: false,
        message: "Failed to get orders",
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
   * Helper: Check if user is admin
   */
  private async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      return user?.role === "ADMIN";
    } catch {
      return false;
    }
  }

  /**
   * Helper: Get valid status transitions
   */
  private getValidStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
      CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
      REJECTED: [],
    };

    return transitions[currentStatus] || [];
  }
}
