import Joi from "joi";

// Dynamic option validation
export const createDynamicOptionSchema = Joi.object({
  parentRole: Joi.string()
    .valid("TUTORING", "PROJECTS_MAKER", "COURSING", "COACHING")
    .required()
    .messages({
      "any.only": "Invalid parent role",
      "any.required": "Parent role is required",
    }),
  parentId: Joi.string().min(1).optional().messages({
    "string.empty": "Parent ID cannot be empty",
  }),
  name: Joi.string().min(1).max(100).required().messages({
    "string.min": "Option name must be at least 1 character long",
    "string.max": "Option name cannot exceed 100 characters",
    "any.required": "Option name is required",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.min": "Sort order cannot be negative",
    "number.integer": "Sort order must be a whole number",
  }),
});

export const updateDynamicOptionSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Option name must be at least 1 character long",
    "string.max": "Option name cannot exceed 100 characters",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.min": "Sort order cannot be negative",
    "number.integer": "Sort order must be a whole number",
  }),
});

// Category children validation
export const createCategoryChildSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "string.min": "Child name must be at least 1 character long",
    "string.max": "Child name cannot exceed 100 characters",
    "any.required": "Child name is required",
  }),
  description: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.min": "Sort order cannot be negative",
    "number.integer": "Sort order must be a whole number",
  }),
});

export const updateCategoryChildSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Child name must be at least 1 character long",
    "string.max": "Child name cannot exceed 100 characters",
  }),
  description: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.min": "Sort order cannot be negative",
    "number.integer": "Sort order must be a whole number",
  }),
});

// Teacher application review validation
export const reviewTeacherApplicationSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required().messages({
    "any.only": "Status must be either APPROVED or REJECTED",
    "any.required": "Status is required",
  }),
  reviewNotes: Joi.string().max(1000).allow("").optional().messages({
    "string.max": "Review notes cannot exceed 1000 characters",
  }),
});

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.min": "Page must be at least 1",
    "number.integer": "Page must be a whole number",
  }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
      "number.integer": "Limit must be a whole number",
    }),
});

// Filter validation for teacher applications
export const teacherApplicationFilterSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "APPROVED", "REJECTED")
    .optional()
    .messages({
      "any.only": "Invalid status filter",
    }),
  role: Joi.string()
    .valid("TUTORING", "PROJECTS_MAKER", "COURSING", "COACHING")
    .optional()
    .messages({
      "any.only": "Invalid role filter",
    }),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
})
  .with("dateTo", "dateFrom")
  .messages({
    "object.with": "dateTo requires dateFrom to be specified",
  });
