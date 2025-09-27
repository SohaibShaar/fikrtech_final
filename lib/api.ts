// API Configuration
const API_BASE_URL = "http://localhost:5000";

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },
  // Student endpoints
  STUDENT: {
    PROFILE: "/api/student/profile",
    UPDATE_PROFILE: "/api/student/profile",
    UPLOAD_DOCUMENT: "/api/student/documents",
    ORDERS: "/api/student/orders",
  },
  // Teacher endpoints
  TEACHER: {
    PROFILE: "/api/teacher/profile",
    UPDATE_PROFILE: "/api/teacher/profile",
    ORDERS: "/api/teacher/orders",
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
    return !!token;
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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Helper function for authenticated API calls
export const authenticatedApiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  const token = tokenUtils.getToken();

  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  return apiCall(endpoint, authOptions);
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

export default API_BASE_URL;
