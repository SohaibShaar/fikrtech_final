// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    TUTORING_CATEGORIES: "/api/auth/tutoring-categories",
  },
  // Student endpoints
  STUDENT: {
    PROFILE: "/api/student/profile",
    UPDATE_PROFILE: "/api/student/profile",
    UPLOAD_DOCUMENT: "/api/student/documents",
    ORDERS: "/api/student/orders",
    REGISTER: "/api/student/register",
    LOGIN: "/api/student/login",
    FORM_PROGRESS: "/api/student/form/progress",
    FORM_STATUS: "/api/student/form/status",
    FORM_STEP: "/api/student/form/step",
    MATERIALS: "/api/student/materials",
  },
  // Teacher endpoints
  TEACHER: {
    PROFILE: "/api/teacher/profile",
    UPDATE_PROFILE: "/api/teacher/profile",
    ORDERS: "/api/teacher/orders",
    REGISTRATION_STEP: "/api/teacher/registration/step",
    REGISTRATION_SUBMIT: "/api/teacher/registration/submit",
    REGISTRATION_PROGRESS: "/api/teacher/registration/progress",
    DYNAMIC_OPTIONS: "/api/teacher/dynamic-options",
    DEEP_OPTIONS: "/api/teacher/deep-options",
    UPLOAD: "/api/teacher/upload",
  },
  // Admin endpoints
  ADMIN: {
    USERS: "/api/admin/users",
    ORDERS: "/api/admin/orders",
    STATISTICS: "/api/admin/statistics",
    DASHBOARD_STATS: "/api/admin/dashboard/stats",
    TEACHER_APPLICATIONS: "/api/admin/teacher-applications",
    PARENT_ROLES: "/api/admin/parent-roles",
    PARENTS: "/api/parents",
    COURSES: "/api/admin/courses",
    COURSE_BY_ID: "/api/admin/courses",
    APPROVE_COURSE: "/api/admin/courses",
    REJECT_COURSE: "/api/admin/courses",
  },
  // Parents endpoints
  PARENTS: {
    LIST: "/api/parents",
    STATS: "/api/parents/stats",
    BY_ROLE: "/api/parents/role",
    BY_ID: "/api/parents",
    CREATE: "/api/parents",
    UPDATE: "/api/parents",
    DELETE_SOFT: "/api/parents",
    DELETE_HARD: "/api/parents",
  },
  // Order endpoints
  ORDER: {
    CREATE: "/api/order/create",
    LIST: "/api/order/list",
    DETAILS: "/api/order/:id",
    UPDATE_STATUS: "/api/order/:id/status",
  },
  // Form completion endpoints
  FORM_COMPLETION: {
    STATUS: "/api/form-completion/status",
  },
  // Pricing endpoints
  PRICING: {
    LIST: "/api/pricing",
  },
  // Course endpoints
  COURSE: {
    CREATE: "/api/course/create",
    TEACHER_COURSES: "/api/course/teacher",
    PUBLIC_COURSES: "/api/course/public",
    BY_ID: "/api/course",
    UPDATE: "/api/course",
    DELETE: "/api/course",
  },
};

// Token management utilities
export const tokenUtils = {
  setToken: (token: string) => {
    localStorage.setItem("authToken", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("authToken");
  },

  removeToken: () => {
    localStorage.removeItem("authToken");
  },

  isTokenValid: (): boolean => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    try {
      // Basic JWT token validation - check if it's a valid JWT format
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      // Decode the payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, remove it
        localStorage.removeItem("authToken");
        return false;
      }

      return true;
    } catch {
      // Invalid token format, remove it
      localStorage.removeItem("authToken");
      return false;
    }
  },

  // Clear all authentication data
  clearAuth: () => {
    localStorage.removeItem("authToken");
  },
};

// Helper function to make API calls
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);

    // Try to parse JSON response, but handle non-JSON responses gracefully
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, create a simple error object
      data = {
        success: false,
        message: "Invalid response format",
      };
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Token is invalid or expired
        tokenUtils.removeToken();
        throw new Error("Authentication failed. Please login again.");
      } else if (response.status === 403) {
        throw new Error("Access denied. Insufficient permissions.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }
    }

    return data;
  } catch (error) {
    // Only log non-network errors to reduce console noise
    if (!(error instanceof TypeError)) {
      console.error("API call failed:", error);
    }
    throw error;
  }
};

// Helper function for authenticated API calls with retry logic
export const authenticatedApiCall = async (
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<unknown> => {
  const token = tokenUtils.getToken();

  if (!token) {
    throw new Error("No authentication token found. Please login again.");
  }

  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    return await apiCall(endpoint, authOptions);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // If it's an authentication error and we haven't retried yet, try to refresh
    if (
      (errorMessage.includes("Authentication failed") ||
        errorMessage.includes("Invalid or expired token") ||
        errorMessage.includes("401")) &&
      retryCount === 0
    ) {
      console.log("Authentication failed, clearing token and retrying...");
      tokenUtils.clearAuth();
      throw new Error("Authentication failed. Please login again.");
    }

    throw error;
  }
};

// Auth-specific API calls
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    role: string;
    fullName: string;
    phone: string;
  }) => {
    return apiCall(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiCall(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return apiCall(API_ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
    });
  },

  getTutoringCategories: async () => {
    return apiCall(API_ENDPOINTS.AUTH.TUTORING_CATEGORIES, {
      method: "GET",
    });
  },

  getTutoringSubcategories: async (parentId: string) => {
    return apiCall(
      `${API_ENDPOINTS.AUTH.TUTORING_CATEGORIES}/${parentId}/subcategories`,
      {
        method: "GET",
      }
    );
  },
};

// Form completion API
export const formCompletionAPI = {
  getStatus: async () => {
    return authenticatedApiCall(API_ENDPOINTS.FORM_COMPLETION.STATUS, {
      method: "GET",
    });
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    return authenticatedApiCall(API_ENDPOINTS.ADMIN.DASHBOARD_STATS, {
      method: "GET",
    });
  },

  getCurrentUser: async () => {
    return authenticatedApiCall("/api/auth/profile", {
      method: "GET",
    });
  },

  getTeacherApplications: async (
    params: {
      status?: string;
      page?: number;
      limit?: number;
      role?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append("status", params.status);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.role) queryParams.append("role", params.role);
    if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.append("dateTo", params.dateTo);

    const endpoint = `${API_ENDPOINTS.ADMIN.TEACHER_APPLICATIONS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return authenticatedApiCall(endpoint, {
      method: "GET",
    });
  },

  getParentRoles: async () => {
    return authenticatedApiCall(API_ENDPOINTS.ADMIN.PARENT_ROLES, {
      method: "GET",
    });
  },

  getParents: async (role?: string) => {
    const endpoint = role
      ? `${API_ENDPOINTS.ADMIN.PARENTS}?parentRole=${role}`
      : API_ENDPOINTS.ADMIN.PARENTS;

    return authenticatedApiCall(endpoint, {
      method: "GET",
    });
  },

  // Parents Statistics
  getParentsStats: async () => {
    return authenticatedApiCall("/api/parents/stats", {
      method: "GET",
    });
  },

  // Get parents with pagination
  getParentsList: async (
    params: {
      page?: number;
      limit?: number;
      parentRole?: string;
      search?: string;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.parentRole) queryParams.append("parentRole", params.parentRole);
    if (params.search) queryParams.append("search", params.search);

    const endpoint = `/api/parents${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return authenticatedApiCall(endpoint, {
      method: "GET",
    });
  },

  // Get parents by role
  getParentsByRole: async (role: string, includeInactive: boolean = false) => {
    const queryParam = includeInactive ? "?includeInactive=true" : "";
    return authenticatedApiCall(`/api/parents/role/${role}${queryParam}`, {
      method: "GET",
    });
  },

  // Get parent by ID
  getParentById: async (id: string) => {
    return authenticatedApiCall(`/api/parents/${id}`, {
      method: "GET",
    });
  },

  // Create new parent
  createParent: async (parentData: {
    name: string;
    description: string;
    parentRole: string;
    parentId?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }) => {
    return authenticatedApiCall("/api/parents", {
      method: "POST",
      body: JSON.stringify(parentData),
    });
  },

  // Update parent
  updateParent: async (
    id: string,
    parentData: {
      name?: string;
      description?: string;
      parentRole?: string;
      parentId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) => {
    return authenticatedApiCall(`/api/parents/${id}`, {
      method: "PUT",
      body: JSON.stringify(parentData),
    });
  },

  // Soft delete parent
  deleteParent: async (id: string) => {
    return authenticatedApiCall(`/api/parents/${id}`, {
      method: "DELETE",
    });
  },

  // Hard delete parent
  deleteParentHard: async (id: string) => {
    return authenticatedApiCall(`/api/parents/${id}?hard=true`, {
      method: "DELETE",
    });
  },

  // Review teacher application
  reviewTeacherApplication: async (
    applicationId: string,
    reviewData: {
      status: "APPROVED" | "REJECTED";
      reviewNotes?: string;
    }
  ) => {
    return authenticatedApiCall(
      `${API_ENDPOINTS.ADMIN.TEACHER_APPLICATIONS}/${applicationId}/review`,
      {
        method: "PUT",
        body: JSON.stringify(reviewData),
      }
    );
  },
};

// Children Management API
export const childrenAPI = {
  // Get children for a category
  getCategoryChildren: async (
    categoryId: string,
    params: {
      page?: number;
      limit?: number;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const endpoint = `/api/admin/categories/${categoryId}/children${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return authenticatedApiCall(endpoint, {
      method: "GET",
    });
  },

  // Create child for a category
  createCategoryChild: async (
    categoryId: string,
    childData: {
      name: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) => {
    return authenticatedApiCall(
      `/api/admin/categories/${categoryId}/children`,
      {
        method: "POST",
        body: JSON.stringify(childData),
      }
    );
  },

  // Update a child
  updateChild: async (
    childId: string,
    childData: {
      name?: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) => {
    return authenticatedApiCall(`/api/admin/children/${childId}`, {
      method: "PUT",
      body: JSON.stringify(childData),
    });
  },

  // Delete a child
  deleteChild: async (childId: string) => {
    return authenticatedApiCall(`/api/admin/children/${childId}`, {
      method: "DELETE",
    });
  },
};

// Student Form API
export const studentFormAPI = {
  // Get form progress
  getFormProgress: async () => {
    return authenticatedApiCall(API_ENDPOINTS.STUDENT.FORM_PROGRESS, {
      method: "GET",
    });
  },

  // Get form status
  getFormStatus: async () => {
    return authenticatedApiCall(API_ENDPOINTS.STUDENT.FORM_STATUS, {
      method: "GET",
    });
  },

  // Save form step
  saveFormStep: async (
    stepNumber: number,
    stepData: Record<string, string | string[]>
  ) => {
    return authenticatedApiCall(
      `${API_ENDPOINTS.STUDENT.FORM_STEP}/${stepNumber}`,
      {
        method: "POST",
        body: JSON.stringify(stepData),
      }
    );
  },

  // Get dynamic materials
  getMaterials: async () => {
    return apiCall(API_ENDPOINTS.STUDENT.MATERIALS, {
      method: "GET",
    });
  },

  // Student login
  login: async (credentials: { email: string; password: string }) => {
    return apiCall(API_ENDPOINTS.STUDENT.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Student registration
  register: async (userData: {
    fullName: string;
    gender: string;
    nationality: string;
    dateOfBirth: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    return apiCall(API_ENDPOINTS.STUDENT.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Create student profile
  createProfile: async () => {
    return authenticatedApiCall("/api/student/create-profile", {
      method: "POST",
    });
  },
};

// Pricing API
export const pricingAPI = {
  getPlans: async () => {
    return apiCall(API_ENDPOINTS.PRICING.LIST, {
      method: "GET",
    });
  },
};
export default API_BASE_URL;
