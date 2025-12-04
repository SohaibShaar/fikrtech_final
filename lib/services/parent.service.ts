import { TeacherRole } from "@prisma/client";
import prisma from "../config/database";
import { ApiResponse, PaginatedResponse } from "../types";

export class ParentService {
  /**
   * Get all parents (dynamic options) under each parent role with pagination
   */
  static async getAllParents(
    page: number = 1,
    limit: number = 10,
    parentRole?: TeacherRole,
    isActive?: boolean
  ): Promise<PaginatedResponse<any>> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (parentRole) {
        where.parentRole = parentRole;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Get only top-level options (parents)
      where.parentId = null;

      const [parents, total] = await Promise.all([
        prisma.dynamicOption.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { parentRole: "asc" },
            { sortOrder: "asc" },
            { name: "asc" },
          ],
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
              include: {
                children: {
                  where: { isActive: true },
                  orderBy: { sortOrder: "asc" },
                },
              },
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
        prisma.dynamicOption.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Parents retrieved successfully",
        data: parents,
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
      console.error("Get all parents error:", error);
      return {
        success: false,
        message: "Failed to retrieve parents",
        errors: error,
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
   * Get parents by specific parent role
   */
  static async getParentsByRole(
    parentRole: TeacherRole,
    includeInactive: boolean = false
  ): Promise<ApiResponse> {
    try {
      const whereClause: any = {
        parentRole,
        parentId: null, // Top-level options only
      };

      // Only filter by isActive if includeInactive is false
      if (!includeInactive) {
        whereClause.isActive = true;
      }

      const parents = await prisma.dynamicOption.findMany({
        where: whereClause,
        orderBy: { sortOrder: "asc" },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: {
              children: {
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
              },
            },
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
        message: `Parents for ${parentRole} retrieved successfully`,
        data: parents,
      };
    } catch (error) {
      console.error("Get parents by role error:", error);
      return {
        success: false,
        message: "Failed to retrieve parents by role",
        errors: error,
      };
    }
  }

  /**
   * Get a single parent by ID with all its children
   */
  static async getParentById(id: string): Promise<ApiResponse> {
    try {
      const parent = await prisma.dynamicOption.findUnique({
        where: { id },
        include: {
          children: {
            orderBy: { sortOrder: "asc" },
            include: {
              children: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
          parent: true, // In case it's actually a child
          _count: {
            select: {
              children: true,
              teacherSelections: true,
              teacherDeepSelections: true,
            },
          },
        },
      });

      if (!parent) {
        return {
          success: false,
          message: "Parent not found",
        };
      }

      return {
        success: true,
        message: "Parent retrieved successfully",
        data: parent,
      };
    } catch (error) {
      console.error("Get parent by ID error:", error);
      return {
        success: false,
        message: "Failed to retrieve parent",
        errors: error,
      };
    }
  }

  /**
   * Create a new parent (top-level dynamic option)
   */
  static async createParent(data: {
    parentRole: TeacherRole;
    name: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ApiResponse> {
    try {
      // Check if parent with same name already exists under this role
      const existingParent = await prisma.dynamicOption.findFirst({
        where: {
          parentRole: data.parentRole,
          name: data.name,
          parentId: null,
        },
      });

      if (existingParent) {
        return {
          success: false,
          message: "Parent with this name already exists under this role",
        };
      }

      // Get the highest sort order for this parent role if not provided
      let sortOrder = data.sortOrder ?? 0;
      if (!data.sortOrder) {
        const lastParent = await prisma.dynamicOption.findFirst({
          where: {
            parentRole: data.parentRole,
            parentId: null,
          },
          orderBy: { sortOrder: "desc" },
        });
        sortOrder = (lastParent?.sortOrder ?? 0) + 1;
      }

      const parent = await prisma.dynamicOption.create({
        data: {
          parentRole: data.parentRole,
          name: data.name,
          description: data.description,
          isActive: data.isActive ?? true,
          sortOrder,
          parentId: null, // Ensure it's a top-level parent
        },
        include: {
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
        message: "Parent created successfully",
        data: parent,
      };
    } catch (error) {
      console.error("Create parent error:", error);
      return {
        success: false,
        message: "Failed to create parent",
        errors: error,
      };
    }
  }

  /**
   * Update a parent
   */
  static async updateParent(
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ): Promise<ApiResponse> {
    try {
      // Check if parent exists and is actually a parent (not a child)
      const existingParent = await prisma.dynamicOption.findUnique({
        where: { id },
      });

      if (!existingParent) {
        return {
          success: false,
          message: "Parent not found",
        };
      }

      if (existingParent.parentId !== null) {
        return {
          success: false,
          message: "This is not a parent option, it's a child option",
        };
      }

      // Check for duplicate name if name is being updated
      if (data.name && data.name !== existingParent.name) {
        const duplicateParent = await prisma.dynamicOption.findFirst({
          where: {
            parentRole: existingParent.parentRole,
            name: data.name,
            parentId: null,
            id: { not: id },
          },
        });

        if (duplicateParent) {
          return {
            success: false,
            message: "Parent with this name already exists under this role",
          };
        }
      }

      const updatedParent = await prisma.dynamicOption.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
        include: {
          children: {
            orderBy: { sortOrder: "asc" },
            include: {
              children: {
                orderBy: { sortOrder: "asc" },
              },
            },
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
        message: "Parent updated successfully",
        data: updatedParent,
      };
    } catch (error) {
      console.error("Update parent error:", error);
      return {
        success: false,
        message: "Failed to update parent",
        errors: error,
      };
    }
  }

  /**
   * Delete a parent (soft delete by setting isActive to false or hard delete)
   */
  static async deleteParent(
    id: string,
    hardDelete: boolean = false
  ): Promise<ApiResponse> {
    try {
      // Check if parent exists and is actually a parent
      const existingParent = await prisma.dynamicOption.findUnique({
        where: { id },
        include: {
          children: true,
          teacherSelections: true,
          teacherDeepSelections: true,
        },
      });

      if (!existingParent) {
        return {
          success: false,
          message: "Parent not found",
        };
      }

      if (existingParent.parentId !== null) {
        return {
          success: false,
          message: "This is not a parent option, it's a child option",
        };
      }

      // Check if parent has active children or teacher selections
      const hasActiveChildren = existingParent.children.some(
        (child) => child.isActive
      );
      const hasTeacherSelections =
        existingParent.teacherSelections.length > 0 ||
        existingParent.teacherDeepSelections.length > 0;

      if (hardDelete) {
        if (hasTeacherSelections) {
          return {
            success: false,
            message:
              "Cannot delete parent with teacher selections. Deactivate instead.",
          };
        }

        // Hard delete - also deletes all children
        await prisma.dynamicOption.delete({
          where: { id },
        });

        return {
          success: true,
          message: "Parent deleted permanently",
        };
      } else {
        // Soft delete - deactivate parent and all children
        await prisma.$transaction(async (tx) => {
          // Deactivate parent
          await tx.dynamicOption.update({
            where: { id },
            data: { isActive: false },
          });

          // Deactivate all children
          await tx.dynamicOption.updateMany({
            where: { parentId: id },
            data: { isActive: false },
          });

          // Deactivate all grandchildren
          const childIds = existingParent.children.map((child) => child.id);
          if (childIds.length > 0) {
            await tx.dynamicOption.updateMany({
              where: { parentId: { in: childIds } },
              data: { isActive: false },
            });
          }
        });

        return {
          success: true,
          message: "Parent and all its children deactivated successfully",
        };
      }
    } catch (error) {
      console.error("Delete parent error:", error);
      return {
        success: false,
        message: "Failed to delete parent",
        errors: error,
      };
    }
  }

  /**
   * Get statistics for all parent roles
   */
  static async getParentRoleStats(): Promise<ApiResponse> {
    try {
      const stats = await prisma.dynamicOption.groupBy({
        by: ["parentRole"],
        where: {
          parentId: null, // Only count parents
        },
        _count: {
          _all: true,
        },
        _sum: {
          sortOrder: true,
        },
      });

      // Get active/inactive counts for each role
      const detailedStats = await Promise.all(
        stats.map(async (stat) => {
          const [activeCount, inactiveCount, totalChildren] = await Promise.all(
            [
              prisma.dynamicOption.count({
                where: {
                  parentRole: stat.parentRole,
                  parentId: null,
                  isActive: true,
                },
              }),
              prisma.dynamicOption.count({
                where: {
                  parentRole: stat.parentRole,
                  parentId: null,
                  isActive: false,
                },
              }),
              prisma.dynamicOption.count({
                where: {
                  parentRole: stat.parentRole,
                  parentId: { not: null },
                },
              }),
            ]
          );

          return {
            parentRole: stat.parentRole,
            totalParents: stat._count._all,
            activeParents: activeCount,
            inactiveParents: inactiveCount,
            totalChildren: totalChildren,
          };
        })
      );

      return {
        success: true,
        message: "Parent role statistics retrieved successfully",
        data: detailedStats,
      };
    } catch (error) {
      console.error("Get parent role stats error:", error);
      return {
        success: false,
        message: "Failed to retrieve parent role statistics",
        errors: error,
      };
    }
  }
}
