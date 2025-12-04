import { Request, Response } from "express";
import { TeacherRole } from "@prisma/client";
import { ParentService } from "../services/parent.service";

export class ParentController {
  /**
   * Get all parents (dynamic options) under each parent role
   * @route GET /api/parents
   */
  static async getAllParents(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const parentRole = req.query.parentRole as TeacherRole;
      const isActive = req.query.isActive
        ? req.query.isActive === "true"
        : undefined;

      const result = await ParentService.getAllParents(
        page,
        limit,
        parentRole,
        isActive
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Get all parents controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: error,
      });
    }
  }

  /**
   * Get parents by specific parent role
   * @route GET /api/parents/role/:parentRole
   */
  static async getParentsByRole(req: Request, res: Response): Promise<void> {
    try {
      const { parentRole } = req.params;
      const includeInactive = req.query.includeInactive === "true";

      // Validate parent role
      if (!Object.values(TeacherRole).includes(parentRole as TeacherRole)) {
        res.status(400).json({
          success: false,
          message: "Invalid parent role",
        });
        return;
      }

      const result = await ParentService.getParentsByRole(
        parentRole as TeacherRole,
        includeInactive
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Get parents by role controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: error,
      });
    }
  }

  /**
   * Get a single parent by ID
   * @route GET /api/parents/:id
   */
  static async getParentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Parent ID is required",
        });
        return;
      }

      const result = await ParentService.getParentById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res
          .status(result.message === "Parent not found" ? 404 : 400)
          .json(result);
      }
    } catch (error) {
      console.error("Get parent by ID controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: error,
      });
    }
  }

  /**
   * Create a new parent
   * @route POST /api/parents
   */
  static async createParent(req: Request, res: Response): Promise<void> {
    try {
      const { parentRole, name, description, isActive, sortOrder } = req.body;

      // Validate required fields
      if (!parentRole || !name) {
        res.status(400).json({
          success: false,
          message: "Parent role and name are required",
        });
        return;
      }

      // Validate parent role
      if (!Object.values(TeacherRole).includes(parentRole)) {
        res.status(400).json({
          success: false,
          message: "Invalid parent role",
        });
        return;
      }

      const result = await ParentService.createParent({
        parentRole,
        name: name.trim(),
        description: description?.trim(),
        isActive,
        sortOrder,
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Create parent controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: error,
      });
    }
  }

  /**
   * Update a parent
   * @route PUT /api/parents/:id
   */
  static async updateParent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, isActive, sortOrder } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Parent ID is required",
        });
        return;
      }

      // Validate that at least one field is provided for update
      if (
        name === undefined &&
        description === undefined &&
        isActive === undefined &&
        sortOrder === undefined
      ) {
        res.status(400).json({
          success: false,
          message: "At least one field must be provided for update",
        });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined)
        updateData.description = description?.trim();
      if (isActive !== undefined) updateData.isActive = isActive;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

      const result = await ParentService.updateParent(id, updateData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res
          .status(result.message === "Parent not found" ? 404 : 400)
          .json(result);
      }
    } catch (error) {
      console.error("Update parent controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: error,
      });
    }
  }

  /**
   * Delete a parent (soft delete by default)
   * @route DELETE /api/parents/:id
   */
  static async deleteParent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const hardDelete = req.query.hard === "true";

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Parent ID is required",
        });
        return;
      }

      const result = await ParentService.deleteParent(id, hardDelete);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res
          .status(result.message === "Parent not found" ? 404 : 400)
          .json(result);
      }
    } catch (error) {
      console.error("Delete parent controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: error,
      });
    }
  }

  /**
   * Get statistics for all parent roles
   * @route GET /api/parents/stats
   */
  static async getParentRoleStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await ParentService.getParentRoleStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Get parent role stats controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: error,
      });
    }
  }
}
