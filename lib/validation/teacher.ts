import Joi from "joi";

// Step 1 validation
export const teacherStep1Schema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Full name must be at least 2 characters long",
    "string.max": "Full name cannot exceed 100 characters",
    "any.required": "Full name is required",
  }),
  gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required().messages({
    "any.only": "Gender must be MALE, FEMALE, or OTHER",
    "any.required": "Gender is required",
  }),
  nationality: Joi.string().min(2).max(50).required().messages({
    "string.min": "Nationality must be at least 2 characters long",
    "string.max": "Nationality cannot exceed 50 characters",
    "any.required": "Nationality is required",
  }),
  dateOfBirth: Joi.date().max("now").required().messages({
    "date.max": "Date of birth cannot be in the future",
    "any.required": "Date of birth is required",
  }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "any.required": "Phone number is required",
    }),
  profilePhoto: Joi.string().optional(),
});

// Step 2 validation
export const teacherStep2Schema = Joi.object({
  selectedRoles: Joi.array()
    .items(
      Joi.string().valid("TUTORING", "PROJECTS_MAKER", "COURSING", "COACHING")
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Please select at least one role",
      "any.required": "Selected roles are required",
      "any.only": "Invalid role selected",
    }),
});

// Step 3 validation
export const teacherStep3Schema = Joi.object({
  selectedSubOptions: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required()
    .messages({
      "array.min": "Please select at least one sub-option",
      "any.required": "Selected sub-options are required",
      "string.empty": "Sub-option ID cannot be empty",
    }),
});

// Step 4 validation
export const teacherStep4Schema = Joi.object({
  selectedDeepOptions: Joi.array()
    .items(Joi.string().min(1))
    .optional()
    .messages({
      "string.empty": "Deep option ID cannot be empty",
    }),
  otherOptions: Joi.array()
    .items(Joi.string().min(1).max(100))
    .optional()
    .messages({
      "string.min": "Other option must be at least 1 character long",
      "string.max": "Other option cannot exceed 100 characters",
    }),
});

// Step 5 validation
export const teacherStep5Schema = Joi.object({
  universityAffiliation: Joi.string().max(200).optional().messages({
    "string.max": "University affiliation cannot exceed 200 characters",
  }),
  highestEducation: Joi.string()
    .valid("BACHELOR", "MASTER", "MBA", "PHD", "OTHER")
    .optional()
    .messages({
      "any.only": "Invalid education level",
    }),
  yearsExperience: Joi.number().integer().min(0).max(50).optional().messages({
    "number.min": "Years of experience cannot be negative",
    "number.max": "Years of experience cannot exceed 50",
    "number.integer": "Years of experience must be a whole number",
  }),
  languagesSpoken: Joi.array()
    .items(Joi.string().min(1).max(50))
    .optional()
    .messages({
      "string.min": "Language must be at least 1 character long",
      "string.max": "Language cannot exceed 50 characters",
    }),
  shortBio: Joi.string().max(1000).optional().messages({
    "string.max": "Short bio cannot exceed 1000 characters",
  }),
  shortVideo: Joi.string().optional(),
});

// Step 6 validation
export const teacherStep6Schema = Joi.object({
  preferredTutoringTime: Joi.string()
    .valid("WEEKDAYS", "WEEKENDS", "FLEXIBLE")
    .optional()
    .messages({
      "any.only": "Invalid tutoring time preference",
    }),
  preferredTutoringMethod: Joi.string()
    .valid("ONLINE", "PHYSICAL")
    .optional()
    .messages({
      "any.only": "Invalid tutoring method preference",
    }),
  location: Joi.string().valid("UAE", "LEBANON", "OTHER").optional().messages({
    "any.only": "Invalid location",
  }),
  proposedHourlyRate: Joi.number().min(0).max(10000).optional().messages({
    "number.min": "Hourly rate cannot be negative",
    "number.max": "Hourly rate cannot exceed 10000",
  }),
});

// Step 7 validation
export const teacherStep7Schema = Joi.object({
  cvFile: Joi.string().optional(),
  certificates: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Certificates must be an array",
  }),
});

// Step 8 validation
export const teacherStep8Schema = Joi.object({
  agreedToTerms: Joi.boolean().valid(true).required().messages({
    "any.only": "You must agree to the terms and conditions",
    "any.required": "Agreement to terms is required",
  }),
});

// Complete registration validation
export const completeTeacherRegistrationSchema = Joi.object({
  // Step 1
  fullName: Joi.string().min(2).max(100).required(),
  gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required(),
  nationality: Joi.string().min(2).max(50).required(),
  dateOfBirth: Joi.date().max("now").required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
  profilePhoto: Joi.string().optional(),

  // Step 2
  selectedRoles: Joi.array()
    .items(
      Joi.string().valid("TUTORING", "PROJECTS_MAKER", "COURSING", "COACHING")
    )
    .min(1)
    .required(),

  // Step 3
  selectedSubOptions: Joi.array().items(Joi.string().min(1)).min(1).required(),

  // Step 4
  selectedDeepOptions: Joi.array().items(Joi.string().min(1)).optional(),
  otherOptions: Joi.array().items(Joi.string().min(1).max(100)).optional(),

  // Step 5
  universityAffiliation: Joi.string().max(200).optional(),
  highestEducation: Joi.string()
    .valid("BACHELOR", "MASTER", "MBA", "PHD", "OTHER")
    .optional(),
  yearsExperience: Joi.number().integer().min(0).max(50).optional(),
  languagesSpoken: Joi.array().items(Joi.string().min(1).max(50)).optional(),
  shortBio: Joi.string().max(1000).optional(),
  shortVideo: Joi.string().optional(),

  // Step 6
  preferredTutoringTime: Joi.string()
    .valid("WEEKDAYS", "WEEKENDS", "FLEXIBLE")
    .optional(),
  preferredTutoringMethod: Joi.string().valid("ONLINE", "PHYSICAL").optional(),
  location: Joi.string().valid("UAE", "LEBANON", "OTHER").optional(),
  proposedHourlyRate: Joi.number().min(0).max(10000).optional(),

  // Step 7
  cvFile: Joi.string().optional(),
  certificates: Joi.array().items(Joi.string()).optional(),

  // Step 8
  agreedToTerms: Joi.boolean().valid(true).required(),
});
