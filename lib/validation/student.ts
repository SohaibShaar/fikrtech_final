import Joi from "joi";

// Student Registration Validation
export const studentRegistrationSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters long",
    "string.max": "Full name cannot exceed 100 characters",
  }),
  gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required().messages({
    "any.only": "Gender must be MALE, FEMALE, or OTHER",
    "any.required": "Gender is required",
  }),
  nationality: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Nationality is required",
    "string.min": "Nationality must be at least 2 characters long",
    "string.max": "Nationality cannot exceed 50 characters",
  }),
  dateOfBirth: Joi.date().max("now").required().messages({
    "date.base": "Date of birth must be a valid date",
    "date.max": "Date of birth cannot be in the future",
    "any.required": "Date of birth is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "string.empty": "Phone number is required",
    }),
});

// Student Form Step Validations
export const studentFormStep1Schema = Joi.object({
  studentType: Joi.string().valid("PARENT", "STUDENT").required().messages({
    "any.only": "Student type must be PARENT or STUDENT",
    "any.required": "Student type is required",
  }),
});

export const studentFormStep2Schema = Joi.object({
  inclusiveLearning: Joi.string()
    .valid("ADHD", "DYSLEXIA", "DYSCALCULIA", "DYSGRAPHIA", "NONE")
    .required()
    .messages({
      "any.only":
        "Inclusive learning must be one of: ADHD, DYSLEXIA, DYSCALCULIA, DYSGRAPHIA, NONE",
      "any.required": "Inclusive learning selection is required",
    }),
});

export const studentFormStep3Schema = Joi.object({
  formGender: Joi.string()
    .valid("MALE", "FEMALE", "OTHER")
    .required()
    .messages({
      "any.only": "Gender must be MALE, FEMALE, or OTHER",
      "any.required": "Gender is required",
    }),
});

export const studentFormStep4Schema = Joi.object({
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
      "any.required": "Curriculum selection is required",
    }),
});

export const studentFormStep5Schema = Joi.object({
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
      "any.required": "Grade selection is required",
    }),
});

export const studentFormStep6Schema = Joi.object({
  selectedCategories: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one category must be selected",
      "any.required": "Category selection is required",
      "string.empty": "Category ID cannot be empty",
    }),
});

export const studentFormStep7Schema = Joi.object({
  selectedSubcategories: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one subcategory must be selected",
      "any.required": "Subcategory selection is required",
      "string.empty": "Subcategory ID cannot be empty",
    }),
});

export const studentFormStep8Schema = Joi.object({
  preferredTime: Joi.string().valid("WEEKEND", "WEEKDAYS").required().messages({
    "any.only": "Preferred time must be WEEKEND or WEEKDAYS",
    "any.required": "Preferred time is required",
  }),
});

export const studentFormStep9Schema = Joi.object({
  preferredTutor: Joi.string()
    .valid("MALE_TUTOR", "FEMALE_TUTOR", "BOTH")
    .required()
    .messages({
      "any.only": "Preferred tutor must be MALE_TUTOR, FEMALE_TUTOR, or BOTH",
      "any.required": "Preferred tutor selection is required",
    }),
});

export const studentFormStep10Schema = Joi.object({
  sessionType: Joi.string()
    .valid("ONLINE_SESSIONS", "OFFLINE_SESSIONS")
    .required()
    .messages({
      "any.only": "Session type must be ONLINE_SESSIONS or OFFLINE_SESSIONS",
      "any.required": "Session type is required",
    }),
});

// Login validation (reused from auth but specific for students)
export const studentLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required",
  }),
});

// Helper function to get validation schema by step
export const getValidationSchemaByStep = (step: number) => {
  const schemas = {
    1: studentFormStep1Schema,
    2: studentFormStep2Schema,
    3: studentFormStep3Schema,
    4: studentFormStep4Schema,
    5: studentFormStep5Schema,
    6: studentFormStep6Schema,
    7: studentFormStep7Schema,
    8: studentFormStep8Schema,
    9: studentFormStep9Schema,
    10: studentFormStep10Schema,
  };

  return schemas[step as keyof typeof schemas];
};
