import Joi from "joi";

// Create order validation
export const createOrderSchema = Joi.object({
  teacherId: Joi.string().uuid().required().messages({
    "string.guid": "Invalid teacher ID format",
    "any.required": "Teacher ID is required",
  }),
  title: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Order title is required",
    "string.min": "Title must be at least 5 characters long",
    "string.max": "Title cannot exceed 200 characters",
  }),
  description: Joi.string().max(1000).optional().messages({
    "string.max": "Description cannot exceed 1000 characters",
  }),
  subject: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Subject is required",
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
    .required()
    .messages({
      "any.only": "Grade must be between GRADE1 and GRADE12",
      "any.required": "Grade is required",
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
    .required()
    .messages({
      "any.only":
        "Curriculum must be one of: IB_SYSTEM, AMERICAN_SYSTEM, BRITISH_SYSTEM, FRENCH_SYSTEM, NATIONAL_SYSTEM, OTHER",
      "any.required": "Curriculum is required",
    }),
  sessionType: Joi.string()
    .valid("ONLINE_SESSIONS", "OFFLINE_SESSIONS")
    .required()
    .messages({
      "any.only": "Session type must be ONLINE_SESSIONS or OFFLINE_SESSIONS",
      "any.required": "Session type is required",
    }),
  preferredTime: Joi.string().valid("WEEKEND", "WEEKDAYS").required().messages({
    "any.only": "Preferred time must be WEEKEND or WEEKDAYS",
    "any.required": "Preferred time is required",
  }),
  sessionsPerWeek: Joi.number().integer().min(1).max(7).default(1).messages({
    "number.min": "Sessions per week must be at least 1",
    "number.max": "Sessions per week cannot exceed 7",
  }),
  sessionDuration: Joi.number()
    .integer()
    .min(30)
    .max(180)
    .default(60)
    .messages({
      "number.min": "Session duration must be at least 30 minutes",
      "number.max": "Session duration cannot exceed 180 minutes",
    }),
  totalSessions: Joi.number().integer().min(1).optional().messages({
    "number.min": "Total sessions must be at least 1",
  }),
  location: Joi.string()
    .max(100)
    .when("sessionType", {
      is: "OFFLINE_SESSIONS",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.max": "Location cannot exceed 100 characters",
      "any.required": "Location is required for offline sessions",
    }),
  address: Joi.string()
    .max(500)
    .when("sessionType", {
      is: "OFFLINE_SESSIONS",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.max": "Address cannot exceed 500 characters",
      "any.required": "Address is required for offline sessions",
    }),
  proposedRate: Joi.number().positive().optional().messages({
    "number.positive": "Proposed rate must be a positive number",
  }),
  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "URGENT")
    .default("MEDIUM")
    .messages({
      "any.only": "Priority must be LOW, MEDIUM, HIGH, or URGENT",
    }),
  preferredStartDate: Joi.date().min("now").optional().messages({
    "date.min": "Preferred start date cannot be in the past",
  }),
  requirements: Joi.string().max(1000).optional().messages({
    "string.max": "Requirements cannot exceed 1000 characters",
  }),
  specialNeeds: Joi.string().max(500).optional().messages({
    "string.max": "Special needs cannot exceed 500 characters",
  }),
  studentNotes: Joi.string().max(1000).optional().messages({
    "string.max": "Student notes cannot exceed 1000 characters",
  }),
});

// Update order validation
export const updateOrderSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  subject: Joi.string().min(2).max(100).optional(),
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
    .optional(),
  curriculum: Joi.string()
    .valid(
      "IB_SYSTEM",
      "AMERICAN_SYSTEM",
      "BRITISH_SYSTEM",
      "FRENCH_SYSTEM",
      "NATIONAL_SYSTEM",
      "OTHER"
    )
    .optional(),
  sessionType: Joi.string()
    .valid("ONLINE_SESSIONS", "OFFLINE_SESSIONS")
    .optional(),
  preferredTime: Joi.string().valid("WEEKEND", "WEEKDAYS").optional(),
  sessionsPerWeek: Joi.number().integer().min(1).max(7).optional(),
  sessionDuration: Joi.number().integer().min(30).max(180).optional(),
  totalSessions: Joi.number().integer().min(1).optional(),
  location: Joi.string().max(100).optional(),
  address: Joi.string().max(500).optional(),
  proposedRate: Joi.number().positive().optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  preferredStartDate: Joi.date().min("now").optional(),
  requirements: Joi.string().max(1000).optional(),
  specialNeeds: Joi.string().max(500).optional(),
  studentNotes: Joi.string().max(1000).optional(),
});

// Order status update validation
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "REJECTED"
    )
    .required()
    .messages({
      "any.only":
        "Status must be one of: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED",
      "any.required": "Status is required",
    }),
  changeReason: Joi.string().max(500).optional().messages({
    "string.max": "Change reason cannot exceed 500 characters",
  }),
  teacherNotes: Joi.string().max(1000).optional().messages({
    "string.max": "Teacher notes cannot exceed 1000 characters",
  }),
  adminNotes: Joi.string().max(1000).optional().messages({
    "string.max": "Admin notes cannot exceed 1000 characters",
  }),
  agreedRate: Joi.number().positive().optional().messages({
    "number.positive": "Agreed rate must be a positive number",
  }),
  actualStartDate: Joi.date().optional(),
  estimatedEndDate: Joi.date().optional(),
});

// Add message to order validation
export const addOrderMessageSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required().messages({
    "string.empty": "Message is required",
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 2000 characters",
  }),
  attachments: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Attachments must be an array of file paths",
  }),
});

// Order search/filter validation
export const orderFilterSchema = Joi.object({
  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "REJECTED"
    )
    .optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
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
    .optional(),
  curriculum: Joi.string()
    .valid(
      "IB_SYSTEM",
      "AMERICAN_SYSTEM",
      "BRITISH_SYSTEM",
      "FRENCH_SYSTEM",
      "NATIONAL_SYSTEM",
      "OTHER"
    )
    .optional(),
  sessionType: Joi.string()
    .valid("ONLINE_SESSIONS", "OFFLINE_SESSIONS")
    .optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  minRate: Joi.number().positive().optional(),
  maxRate: Joi.number().positive().optional(),
  subject: Joi.string().optional(),
});

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

// Teacher response to order validation
export const teacherOrderResponseSchema = Joi.object({
  response: Joi.string()
    .valid("ACCEPT", "REJECT", "NEGOTIATE")
    .required()
    .messages({
      "any.only": "Response must be ACCEPT, REJECT, or NEGOTIATE",
      "any.required": "Response is required",
    }),
  message: Joi.string().max(1000).optional().messages({
    "string.max": "Message cannot exceed 1000 characters",
  }),
  counterRate: Joi.number()
    .positive()
    .when("response", {
      is: "NEGOTIATE",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "number.positive": "Counter rate must be a positive number",
      "any.required": "Counter rate is required when negotiating",
    }),
  availableStartDate: Joi.date().min("now").optional().messages({
    "date.min": "Available start date cannot be in the past",
  }),
});
