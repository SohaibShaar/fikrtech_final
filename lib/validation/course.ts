import Joi from "joi";

// Create course validation
export const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.min": "Course title must be at least 3 characters long",
    "string.max": "Course title cannot exceed 200 characters",
    "any.required": "Course title is required",
  }),
  description: Joi.string().max(5000).allow("").optional().messages({
    "string.max": "Description cannot exceed 5000 characters",
  }),
  subject: Joi.string().min(2).max(100).required().messages({
    "string.min": "Subject must be at least 2 characters long",
    "string.max": "Subject cannot exceed 100 characters",
    "any.required": "Subject is required",
  }),
  grade: Joi.string()
    .valid(
      "GRADE1",
      "GRADE2",
      "GRADE3",
      "GRADE4",
      "GRADE5",
      "GRADE6",
      "GRADE7",
      "GRADE8",
      "GRADE9",
      "GRADE10",
      "GRADE11",
      "GRADE12"
    )
    .optional()
    .messages({
      "any.only": "Invalid grade level",
    }),
  curriculum: Joi.string()
    .valid(
      "IB_SYSTEM",
      "AMERICAN_SYSTEM",
      "BRITISH_SYSTEM",
      "FRENCH_SYSTEM",
      "NATIONAL_SYSTEM",
      "OTHER"
    )
    .optional()
    .messages({
      "any.only": "Invalid curriculum",
    }),
  price: Joi.number().min(0).max(100000).required().messages({
    "number.min": "Price cannot be negative",
    "number.max": "Price cannot exceed 100000",
    "any.required": "Price is required",
  }),
  duration: Joi.number().integer().min(1).max(1000).optional().messages({
    "number.min": "Duration must be at least 1 hour",
    "number.max": "Duration cannot exceed 1000 hours",
    "number.integer": "Duration must be a whole number",
  }),
  maxStudents: Joi.number().integer().min(1).max(1000).optional().messages({
    "number.min": "Maximum students must be at least 1",
    "number.max": "Maximum students cannot exceed 1000",
    "number.integer": "Maximum students must be a whole number",
  }),
  thumbnail: Joi.string().allow("").optional(),
});

// Update course validation
export const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional().messages({
    "string.min": "Course title must be at least 3 characters long",
    "string.max": "Course title cannot exceed 200 characters",
  }),
  description: Joi.string().max(5000).optional().allow("").messages({
    "string.max": "Description cannot exceed 5000 characters",
  }),
  subject: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Subject must be at least 2 characters long",
    "string.max": "Subject cannot exceed 100 characters",
  }),
  grade: Joi.string()
    .valid(
      "GRADE1",
      "GRADE2",
      "GRADE3",
      "GRADE4",
      "GRADE5",
      "GRADE6",
      "GRADE7",
      "GRADE8",
      "GRADE9",
      "GRADE10",
      "GRADE11",
      "GRADE12"
    )
    .optional()
    .messages({
      "any.only": "Invalid grade level",
    }),
  curriculum: Joi.string()
    .valid(
      "IB_SYSTEM",
      "AMERICAN_SYSTEM",
      "BRITISH_SYSTEM",
      "FRENCH_SYSTEM",
      "NATIONAL_SYSTEM",
      "OTHER"
    )
    .optional()
    .messages({
      "any.only": "Invalid curriculum",
    }),
  price: Joi.number().min(0).max(100000).optional().messages({
    "number.min": "Price cannot be negative",
    "number.max": "Price cannot exceed 100000",
  }),
  duration: Joi.number().integer().min(1).max(1000).optional().messages({
    "number.min": "Duration must be at least 1 hour",
    "number.max": "Duration cannot exceed 1000 hours",
    "number.integer": "Duration must be a whole number",
  }),
  maxStudents: Joi.number().integer().min(1).max(1000).optional().messages({
    "number.min": "Maximum students must be at least 1",
    "number.max": "Maximum students cannot exceed 1000",
    "number.integer": "Maximum students must be a whole number",
  }),
  thumbnail: Joi.string().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

// Course filters validation
export const courseFiltersSchema = Joi.object({
  subject: Joi.string().optional(),
  grade: Joi.string().optional(),
  curriculum: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  search: Joi.string().optional(),
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").optional(),
  teacherId: Joi.string().optional(),
});
