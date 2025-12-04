import Joi from "joi";
import { TeacherRole } from "@prisma/client";

// Create parent validation schema
export const createParentSchema = Joi.object({
  parentRole: Joi.string()
    .valid(...Object.values(TeacherRole))
    .required()
    .messages({
      "any.required": "Parent role is required",
      "any.only": "Invalid parent role",
    }),
  name: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Name cannot be empty",
    "string.max": "Name must be less than 100 characters",
    "any.required": "Name is required",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "Description must be less than 500 characters",
  }),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.min": "Sort order must be a positive integer",
  }),
});

// Update parent validation schema
export const updateParentSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    "string.empty": "Name cannot be empty",
    "string.max": "Name must be less than 100 characters",
  }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Description must be less than 500 characters",
  }),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.min": "Sort order must be a positive integer",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Query parameters validation schema
export const getParentsQuerySchema = Joi.object({
  page: Joi.string().pattern(/^\d+$/).optional().messages({
    "string.pattern.base": "Page must be a number",
  }),
  limit: Joi.string().pattern(/^\d+$/).optional().messages({
    "string.pattern.base": "Limit must be a number",
  }),
  parentRole: Joi.string()
    .valid(...Object.values(TeacherRole))
    .optional(),
  isActive: Joi.string().valid("true", "false").optional().messages({
    "any.only": "isActive must be true or false",
  }),
});

// Parent role parameter validation
export const parentRoleParamSchema = Joi.object({
  parentRole: Joi.string()
    .valid(...Object.values(TeacherRole))
    .required()
    .messages({
      "any.required": "Parent role is required",
      "any.only": "Invalid parent role",
    }),
});

// ID parameter validation
export const idParamSchema = Joi.object({
  id: Joi.string().min(1).required().messages({
    "string.empty": "ID cannot be empty",
    "any.required": "ID is required",
  }),
});

// Delete query validation
export const deleteParentQuerySchema = Joi.object({
  hard: Joi.string().valid("true", "false").optional().messages({
    "any.only": "hard must be true or false",
  }),
});
