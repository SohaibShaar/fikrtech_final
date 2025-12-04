import { NextRequest, NextResponse } from "next/server";
import {
  authenticate,
  isAdmin,
  isTeacher,
  isStudent,
} from "@/lib/middleware/auth";
import { AuthController } from "@/lib/controllers/auth.controller";
import { TeacherController } from "@/lib/controllers/teacher.controller";
import { AdminController } from "@/lib/controllers/admin.controller";
import { StudentController } from "@/lib/controllers/student.controller";
import { ParentController } from "@/lib/controllers/parent.controller";
import { OrderController } from "@/lib/controllers/order.controller";
import { CourseController } from "@/lib/controllers/course.controller";
import { FormCompletionController } from "@/lib/controllers/form-completion.controller";
import {
  getPackages,
  createPackage,
  deletePackage,
  getPackageById,
  updatePackage,
} from "@/lib/controllers/tutoringPackage.controller";
import prisma from "@/lib/config/database";

// Helper function to create JSON response
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Helper function to get path segments
function getPathSegments(request: NextRequest): string[] {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Remove 'api' from the start
  return pathParts.slice(1);
}

// Helper function to convert Next.js request to Express-like format
async function convertRequest(request: NextRequest, user?: any) {
  const url = new URL(request.url);
  const pathSegments = getPathSegments(request);

  let body: any = {};
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  } else if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    } catch {
      body = {};
    }
  }

  // Parse query parameters
  const query: any = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  // Parse params from path
  const params: any = {};

  return {
    body,
    query,
    params,
    user,
    method: request.method,
    headers: request.headers,
    url: url.pathname,
    pathSegments,
  };
}

// Mock Express response object
function createMockResponse() {
  let statusCode = 200;
  let responseData: any = null;

  return {
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: any) => {
          responseData = { data, status: statusCode };
          return responseData;
        },
      };
    },
    json: (data: any) => {
      responseData = { data, status: statusCode };
      return responseData;
    },
    getResponse: () => responseData,
  };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================
async function handleHealthCheck() {
  return jsonResponse({
    success: true,
    message: "Educational Platform API is running",
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// AUTH ROUTES
// ============================================================================
async function handleAuthRoutes(request: NextRequest, segments: string[]) {
  const method = request.method;
  const action = segments[1]; // auth/[action]

  if (action === "register" && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await AuthController.register({ body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "login" && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await AuthController.login({ body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "profile" && method === "GET") {
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return jsonResponse(authResult.error, 401);
    }
    const res = createMockResponse();
    await AuthController.getProfile(
      { user: authResult.user } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "logout" && method === "POST") {
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return jsonResponse(authResult.error, 401);
    }
    const res = createMockResponse();
    await AuthController.logout({ user: authResult.user } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "create-admin" && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await AuthController.createAdmin({ body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "tutoring-categories" && method === "GET") {
    if (segments[2]) {
      // /auth/tutoring-categories/:parentId/subcategories
      const parentId = segments[2];
      const res = createMockResponse();
      await AuthController.getTutoringSubcategories(
        { params: { parentId } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    } else {
      const res = createMockResponse();
      await AuthController.getTutoringCategories({} as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  return jsonResponse(
    { success: false, message: "Auth endpoint not found" },
    404
  );
}

// ============================================================================
// TEACHER ROUTES
// ============================================================================
async function handleTeacherRoutes(request: NextRequest, segments: string[]) {
  const method = request.method;
  const action = segments[1]; // teacher/[action]

  // Public routes
  if (action === "dynamic-options" && method === "GET") {
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await TeacherController.getDynamicOptions({ query } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "deep-options" && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await TeacherController.getDeepOptions({ body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  // Protected routes
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return jsonResponse(authResult.error, 401);
  }

  if (action === "registration") {
    const subAction = segments[2]; // registration/[subAction]

    if (subAction === "step" && method === "POST") {
      const step = segments[3];
      const body = await request.json();
      const res = createMockResponse();
      await TeacherController.saveRegistrationStep(
        { user: authResult.user, params: { step }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (subAction === "submit" && method === "POST") {
      const body = await request.json();
      const res = createMockResponse();
      await TeacherController.submitRegistration(
        { user: authResult.user, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (subAction === "progress" && method === "GET") {
      const res = createMockResponse();
      await TeacherController.getRegistrationProgress(
        { user: authResult.user } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  if (action === "upload" && method === "POST") {
    // Handle file upload
    const formData = await request.formData();
    const files: any = {};
    formData.forEach((value, key) => {
      files[key] = value;
    });
    const res = createMockResponse();
    await TeacherController.uploadFile(
      { user: authResult.user, files } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "profile" && method === "GET") {
    const res = createMockResponse();
    await TeacherController.getProfile(
      { user: authResult.user } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "profile" && method === "PUT") {
    const body = await request.json();
    const res = createMockResponse();
    await TeacherController.updateProfile(
      { user: authResult.user, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  return jsonResponse(
    { success: false, message: "Teacher endpoint not found" },
    404
  );
}

// ============================================================================
// ADMIN ROUTES
// ============================================================================
async function handleAdminRoutes(request: NextRequest, segments: string[]) {
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return jsonResponse(authResult.error, 401);
  }

  if (!isAdmin(authResult.user)) {
    return jsonResponse(
      { success: false, message: "Insufficient permissions" },
      403
    );
  }

  const method = request.method;
  const action = segments[1]; // admin/[action]

  // Dashboard stats
  if (action === "dashboard" && segments[2] === "stats" && method === "GET") {
    const res = createMockResponse();
    await AdminController.getDashboardStats({} as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  // Teacher applications
  if (action === "teacher-applications") {
    if (!segments[2] && method === "GET") {
      const url = new URL(request.url);
      const query: any = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      const res = createMockResponse();
      await AdminController.getTeacherApplications(
        { query } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && !segments[3] && method === "GET") {
      const applicationId = segments[2];
      const res = createMockResponse();
      await AdminController.getTeacherApplication(
        { params: { applicationId } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && segments[3] === "review" && method === "PUT") {
      const applicationId = segments[2];
      const body = await request.json();
      const res = createMockResponse();
      await AdminController.reviewTeacherApplication(
        { params: { applicationId }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  // Dynamic options
  if (action === "dynamic-options") {
    if (!segments[2] && method === "GET") {
      const res = createMockResponse();
      await AdminController.getDynamicOptions({} as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (!segments[2] && method === "POST") {
      const body = await request.json();
      const res = createMockResponse();
      await AdminController.createDynamicOption({ body } as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && method === "PUT") {
      const optionId = segments[2];
      const body = await request.json();
      const res = createMockResponse();
      await AdminController.updateDynamicOption(
        { params: { optionId }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && method === "DELETE") {
      const optionId = segments[2];
      const res = createMockResponse();
      await AdminController.deleteDynamicOption(
        { params: { optionId } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  // Parent roles
  if (action === "parent-roles" && method === "GET") {
    const res = createMockResponse();
    await AdminController.getParentRoles({} as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  // Categories children
  if (action === "categories" && segments[2]) {
    const categoryId = segments[2];

    if (segments[3] === "children" && method === "GET") {
      const url = new URL(request.url);
      const query: any = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      const res = createMockResponse();
      await AdminController.getCategoryChildren(
        { params: { categoryId }, query } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[3] === "children" && method === "POST") {
      const body = await request.json();
      const res = createMockResponse();
      await AdminController.createCategoryChild(
        { params: { categoryId }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  if (action === "children" && segments[2]) {
    const childId = segments[2];

    if (method === "PUT") {
      const body = await request.json();
      const res = createMockResponse();
      await AdminController.updateCategoryChild(
        { params: { childId }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (method === "DELETE") {
      const res = createMockResponse();
      await AdminController.deleteCategoryChild(
        { params: { childId } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  // Students
  if (action === "students") {
    if (!segments[2] && method === "GET") {
      const url = new URL(request.url);
      const query: any = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      const res = createMockResponse();
      await AdminController.getAllStudents({ query } as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (
      segments[2] === "analytics" &&
      segments[3] === "form-responses" &&
      method === "GET"
    ) {
      const res = createMockResponse();
      await AdminController.getStudentFormAnalytics({} as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && !segments[3] && method === "GET") {
      const studentId = segments[2];
      const res = createMockResponse();
      await AdminController.getStudentById(
        { params: { studentId } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  // Orders
  if (action === "orders") {
    if (!segments[2] && method === "GET") {
      const url = new URL(request.url);
      const query: any = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      const res = createMockResponse();
      await AdminController.getAllOrders({ query } as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (
      segments[2] === "analytics" &&
      segments[3] === "overview" &&
      method === "GET"
    ) {
      const res = createMockResponse();
      await AdminController.getOrderAnalytics({} as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && !segments[3] && method === "GET") {
      const orderId = segments[2];
      const res = createMockResponse();
      await AdminController.getOrderById(
        { params: { orderId } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && segments[3] === "status" && method === "PUT") {
      const orderId = segments[2];
      const body = await request.json();
      const res = createMockResponse();
      await AdminController.updateOrderStatus(
        { params: { orderId }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  // Courses
  if (action === "courses") {
    if (!segments[2] && method === "GET") {
      const url = new URL(request.url);
      const query: any = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      const res = createMockResponse();
      await AdminController.getAllCourses({ query } as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && !segments[3] && method === "GET") {
      const courseId = segments[2];
      const res = createMockResponse();
      await AdminController.getCourseById(
        { params: { courseId } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && segments[3] === "approve" && method === "PUT") {
      const courseId = segments[2];
      const res = createMockResponse();
      await AdminController.approveCourse(
        { params: { courseId } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && segments[3] === "reject" && method === "PUT") {
      const courseId = segments[2];
      const body = await request.json();
      const res = createMockResponse();
      await AdminController.rejectCourse(
        { params: { courseId }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  return jsonResponse(
    { success: false, message: "Admin endpoint not found" },
    404
  );
}

// ============================================================================
// STUDENT ROUTES
// ============================================================================
async function handleStudentRoutes(request: NextRequest, segments: string[]) {
  const method = request.method;
  const action = segments[1]; // student/[action]

  const studentController = new StudentController();

  // Public routes
  if (action === "register" && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await studentController.register({ body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "login" && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await studentController.login({ body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "materials" && method === "GET") {
    const res = createMockResponse();
    await studentController.getDynamicMaterials({} as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  // Protected routes
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return jsonResponse(authResult.error, 401);
  }

  if (action === "profile" && method === "GET") {
    const res = createMockResponse();
    await studentController.getProfile(
      { user: authResult.user } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "create-profile" && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await studentController.createStudentProfile(
      { user: authResult.user, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "form") {
    const subAction = segments[2];

    if (subAction === "progress" && method === "GET") {
      const res = createMockResponse();
      await studentController.getFormProgress(
        { user: authResult.user } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (subAction === "status" && method === "GET") {
      const res = createMockResponse();
      await studentController.getFormStatus(
        { user: authResult.user } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (subAction === "step" && method === "POST") {
      const stepNumber = segments[3];
      const body = await request.json();
      const res = createMockResponse();
      await studentController.saveFormStep(
        { user: authResult.user, params: { stepNumber }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  if (action === "all" && method === "GET") {
    const res = createMockResponse();
    await studentController.getAllStudents(
      { user: authResult.user } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (
    segments[1] &&
    !action.includes("profile") &&
    !action.includes("form") &&
    !action.includes("materials") &&
    !action.includes("all") &&
    method === "GET"
  ) {
    const studentId = segments[1];
    const res = createMockResponse();
    await studentController.getStudentById(
      { user: authResult.user, params: { studentId } } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  return jsonResponse(
    { success: false, message: "Student endpoint not found" },
    404
  );
}

// ============================================================================
// PARENT ROUTES
// ============================================================================
async function handleParentRoutes(request: NextRequest, segments: string[]) {
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return jsonResponse(authResult.error, 401);
  }

  if (!isAdmin(authResult.user)) {
    return jsonResponse(
      { success: false, message: "Insufficient permissions" },
      403
    );
  }

  const method = request.method;
  const action = segments[1]; // parents/[action]

  if (action === "stats" && method === "GET") {
    const res = createMockResponse();
    await ParentController.getParentRoleStats({} as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (!action && method === "GET") {
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await ParentController.getAllParents({ query } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "role" && segments[2] && method === "GET") {
    const parentRole = segments[2];
    const res = createMockResponse();
    await ParentController.getParentsByRole(
      { params: { parentRole } } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (
    action &&
    action !== "stats" &&
    action !== "role" &&
    !segments[2] &&
    method === "GET"
  ) {
    const id = action;
    const res = createMockResponse();
    await ParentController.getParentById({ params: { id } } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (!action && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await ParentController.createParent({ body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && method === "PUT") {
    const id = action;
    const body = await request.json();
    const res = createMockResponse();
    await ParentController.updateParent(
      { params: { id }, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && method === "DELETE") {
    const id = action;
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await ParentController.deleteParent(
      { params: { id }, query } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  return jsonResponse(
    { success: false, message: "Parent endpoint not found" },
    404
  );
}

// ============================================================================
// ORDER ROUTES
// ============================================================================
async function handleOrderRoutes(request: NextRequest, segments: string[]) {
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return jsonResponse(authResult.error, 401);
  }

  const method = request.method;
  const action = segments[1]; // orders/[action]

  const orderController = new OrderController();

  if (!action && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await orderController.createOrder(
      { user: authResult.user, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "student" && method === "GET") {
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await orderController.getStudentOrders(
      { user: authResult.user, query } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "teacher" && method === "GET") {
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await orderController.getTeacherOrders(
      { user: authResult.user, query } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "admin" && segments[2] === "all" && method === "GET") {
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await orderController.getAllOrders(
      { user: authResult.user, query } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && !segments[2] && method === "GET") {
    const orderId = action;
    const res = createMockResponse();
    await orderController.getOrderById(
      { user: authResult.user, params: { orderId } } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && !segments[2] && method === "PUT") {
    const orderId = action;
    const body = await request.json();
    const res = createMockResponse();
    await orderController.updateOrder(
      { user: authResult.user, params: { orderId }, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && segments[2] === "status" && method === "PUT") {
    const orderId = action;
    const body = await request.json();
    const res = createMockResponse();
    await orderController.updateOrderStatus(
      { user: authResult.user, params: { orderId }, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && segments[2] === "messages" && method === "POST") {
    const orderId = action;
    const body = await request.json();
    const res = createMockResponse();
    await orderController.addOrderMessage(
      { user: authResult.user, params: { orderId }, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && segments[2] === "cancel" && method === "POST") {
    const orderId = action;
    const body = await request.json();
    const res = createMockResponse();
    await orderController.cancelOrder(
      { user: authResult.user, params: { orderId }, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && segments[2] === "respond" && method === "POST") {
    const orderId = action;
    const body = await request.json();
    const res = createMockResponse();
    await orderController.teacherOrderResponse(
      { user: authResult.user, params: { orderId }, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  return jsonResponse(
    { success: false, message: "Order endpoint not found" },
    404
  );
}

// ============================================================================
// COURSE ROUTES
// ============================================================================
async function handleCourseRoutes(request: NextRequest, segments: string[]) {
  const method = request.method;
  const action = segments[1]; // course/[action]

  // Public routes
  if (action === "public" && method === "GET") {
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await CourseController.getPublicCourses({ query } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (
    action &&
    action !== "create" &&
    action !== "teacher" &&
    action !== "admin" &&
    action !== "public" &&
    !segments[2] &&
    method === "GET"
  ) {
    const id = action;
    const res = createMockResponse();
    await CourseController.getCourseById({ params: { id } } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  // Protected routes
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return jsonResponse(authResult.error, 401);
  }

  if (action === "create" && method === "POST") {
    if (!isTeacher(authResult.user)) {
      return jsonResponse(
        { success: false, message: "Insufficient permissions" },
        403
      );
    }
    const body = await request.json();
    const res = createMockResponse();
    await CourseController.createCourse(
      { user: authResult.user, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "teacher" && method === "GET") {
    if (!isTeacher(authResult.user)) {
      return jsonResponse(
        { success: false, message: "Insufficient permissions" },
        403
      );
    }
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await CourseController.getTeacherCourses(
      { user: authResult.user, query } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && !segments[2] && method === "PUT") {
    if (!isTeacher(authResult.user)) {
      return jsonResponse(
        { success: false, message: "Insufficient permissions" },
        403
      );
    }
    const id = action;
    const body = await request.json();
    const res = createMockResponse();
    await CourseController.updateCourse(
      { user: authResult.user, params: { id }, body } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && !segments[2] && method === "DELETE") {
    if (!isTeacher(authResult.user)) {
      return jsonResponse(
        { success: false, message: "Insufficient permissions" },
        403
      );
    }
    const id = action;
    const res = createMockResponse();
    await CourseController.deleteCourse(
      { user: authResult.user, params: { id } } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action === "admin") {
    if (!isAdmin(authResult.user)) {
      return jsonResponse(
        { success: false, message: "Insufficient permissions" },
        403
      );
    }

    if (segments[2] === "all" && method === "GET") {
      const url = new URL(request.url);
      const query: any = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      const res = createMockResponse();
      await CourseController.getAllCourses({ query } as any, res as any);
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && segments[3] === "approve" && method === "PUT") {
      const id = segments[2];
      const res = createMockResponse();
      await CourseController.approveCourse(
        { params: { id } } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }

    if (segments[2] && segments[3] === "reject" && method === "PUT") {
      const id = segments[2];
      const body = await request.json();
      const res = createMockResponse();
      await CourseController.rejectCourse(
        { params: { id }, body } as any,
        res as any
      );
      const response = res.getResponse();
      return jsonResponse(response.data, response.status);
    }
  }

  return jsonResponse(
    { success: false, message: "Course endpoint not found" },
    404
  );
}

// ============================================================================
// PRICING (TUTORING PACKAGE) ROUTES
// ============================================================================
async function handlePricingRoutes(request: NextRequest, segments: string[]) {
  const method = request.method;
  const action = segments[1]; // pricing/[action]

  // Public route
  if (!action && method === "GET") {
    const url = new URL(request.url);
    const query: any = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const res = createMockResponse();
    await getPackages({ query } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  // Protected routes
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return jsonResponse(authResult.error, 401);
  }

  if (!isAdmin(authResult.user)) {
    return jsonResponse(
      { success: false, message: "Insufficient permissions" },
      403
    );
  }

  if (action && method === "GET") {
    const id = action;
    const res = createMockResponse();
    await getPackageById({ params: { id } } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (!action && method === "POST") {
    const body = await request.json();
    const res = createMockResponse();
    await createPackage({ body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && method === "PUT") {
    const id = action;
    const body = await request.json();
    const res = createMockResponse();
    await updatePackage({ params: { id }, body } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  if (action && method === "DELETE") {
    const id = action;
    const res = createMockResponse();
    await deletePackage({ params: { id } } as any, res as any);
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  return jsonResponse(
    { success: false, message: "Pricing endpoint not found" },
    404
  );
}

// ============================================================================
// FORM COMPLETION ROUTES
// ============================================================================
async function handleFormCompletionRoutes(
  request: NextRequest,
  segments: string[]
) {
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return jsonResponse(authResult.error, 401);
  }

  const method = request.method;
  const action = segments[1]; // form-completion/[action]

  if (action === "status" && method === "GET") {
    const res = createMockResponse();
    await FormCompletionController.checkFormCompletion(
      { user: authResult.user } as any,
      res as any
    );
    const response = res.getResponse();
    return jsonResponse(response.data, response.status);
  }

  return jsonResponse(
    { success: false, message: "Form completion endpoint not found" },
    404
  );
}

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path;

    if (!segments || segments.length === 0) {
      return jsonResponse({ success: false, message: "Invalid API path" }, 404);
    }

    const mainRoute = segments[0];

    // Health check
    if (mainRoute === "health") {
      return handleHealthCheck();
    }

    // Route to appropriate handler
    switch (mainRoute) {
      case "auth":
        return handleAuthRoutes(request, segments);
      case "teacher":
        return handleTeacherRoutes(request, segments);
      case "admin":
        return handleAdminRoutes(request, segments);
      case "student":
        return handleStudentRoutes(request, segments);
      case "parents":
        return handleParentRoutes(request, segments);
      case "orders":
        return handleOrderRoutes(request, segments);
      case "course":
        return handleCourseRoutes(request, segments);
      case "pricing":
        return handlePricingRoutes(request, segments);
      case "form-completion":
        return handleFormCompletionRoutes(request, segments);
      default:
        return jsonResponse(
          { success: false, message: "Endpoint not found" },
          404
        );
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return jsonResponse(
      {
        success: false,
        message: error.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
      500
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return GET(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return GET(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return GET(request, { params });
}


