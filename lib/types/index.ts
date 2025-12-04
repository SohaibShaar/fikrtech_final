import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface TeacherRegistrationStep1 {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  nationality: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  profilePhoto?: string;
}

export interface TeacherRegistrationStep2 {
  selectedRoles: ("TUTORING" | "TEACHING" | "COURSING" | "COACHING")[];
}

export interface TeacherRegistrationStep3 {
  selectedSubOptions: string[]; // Dynamic option IDs
}

export interface TeacherRegistrationStep4 {
  selectedDeepOptions: string[]; // Dynamic option IDs
  otherOptions?: string[]; // Custom options if not available
}

export interface TeacherRegistrationStep5 {
  universityAffiliation?: string;
  highestEducation?: "BACHELOR" | "MASTER" | "MBA" | "PHD" | "OTHER";
  yearsExperience?: number;
  languagesSpoken?: string[];
  shortBio?: string;
  shortVideo?: string;
}

export interface TeacherRegistrationStep6 {
  preferredTutoringTime?: "WEEKDAYS" | "WEEKENDS" | "FLEXIBLE";
  preferredTutoringMethod?: "ONLINE" | "PHYSICAL";
  location?: "UAE" | "LEBANON" | "OTHER";
  proposedHourlyRate?: number;
}

export interface TeacherRegistrationStep7 {
  cvFile?: string;
  certificates?: string[];
}

export interface TeacherRegistrationStep8 {
  agreedToTerms: boolean;
}

export interface CompleteTeacherRegistration
  extends TeacherRegistrationStep1,
    TeacherRegistrationStep2,
    TeacherRegistrationStep3,
    TeacherRegistrationStep4,
    TeacherRegistrationStep5,
    TeacherRegistrationStep6,
    TeacherRegistrationStep7,
    TeacherRegistrationStep8 {}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: any;
}

// Student Registration Interface
export interface StudentRegistrationData {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  nationality: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

// Student Form Step Interfaces
export interface StudentFormStep1 {
  studentType: "PARENT" | "STUDENT";
}

export interface StudentFormStep2 {
  inclusiveLearning:
    | "ADHD"
    | "DYSLEXIA"
    | "DYSCALCULIA"
    | "DYSGRAPHIA"
    | "NONE";
}

export interface StudentFormStep3 {
  formGender: "MALE" | "FEMALE" | "OTHER";
}

export interface StudentFormStep4 {
  curriculum:
    | "IB_SYSTEM"
    | "AMERICAN_SYSTEM"
    | "BRITISH_SYSTEM"
    | "FRENCH_SYSTEM"
    | "NATIONAL_SYSTEM"
    | "OTHER";
}

export interface StudentFormStep5 {
  grade:
    | "GRADE1"
    | "GRADE2"
    | "GRADE3"
    | "GRADE4"
    | "GRADE5"
    | "GRADE6"
    | "GRADE7"
    | "GRADE8"
    | "GRADE9"
    | "GRADE10"
    | "GRADE11"
    | "GRADE12";
}

export interface StudentFormStep6 {
  selectedCategories: string[]; // Array of selected parent category IDs
}

export interface StudentFormStep7 {
  selectedSubcategories: string[]; // Array of subcategory IDs
}

export interface StudentFormStep8 {
  preferredTime: "WEEKEND" | "WEEKDAYS";
}

export interface StudentFormStep9 {
  preferredTutor: "MALE_TUTOR" | "FEMALE_TUTOR" | "BOTH";
}

export interface StudentFormStep10 {
  sessionType: "ONLINE_SESSIONS" | "OFFLINE_SESSIONS";
}

export interface StudentFormData
  extends StudentFormStep1,
    StudentFormStep2,
    StudentFormStep3,
    StudentFormStep4,
    StudentFormStep5,
    StudentFormStep6,
    StudentFormStep7,
    StudentFormStep8,
    StudentFormStep9,
    StudentFormStep10 {
  currentStep: number;
  isCompleted: boolean;
}



