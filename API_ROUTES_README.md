# Next.js API Routes - Quick Start Guide

## 🚀 ما تم إنجازه

تم تحويل جميع Backend API endpoints من Express إلى Next.js App Router API Routes في ملف واحد شامل.

## 📁 البنية الجديدة

```
frontend/
├── app/
│   └── api/
│       └── [...path]/
│           └── route.ts          # ملف API الرئيسي (جميع الـ endpoints)
├── lib/
│   ├── config/
│   │   ├── database.ts           # Prisma configuration
│   │   └── jwt.ts                # JWT utilities
│   ├── controllers/              # 9 controllers
│   │   ├── auth.controller.ts
│   │   ├── teacher.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── student.controller.ts
│   │   ├── parent.controller.ts
│   │   ├── order.controller.ts
│   │   ├── course.controller.ts
│   │   ├── form-completion.controller.ts
│   │   └── tutoringPackage.controller.ts
│   ├── services/                 # 8 services
│   ├── middleware/
│   │   └── auth.ts               # Authentication middleware
│   ├── validation/               # 7 validation schemas
│   └── types/
│       └── index.ts              # TypeScript types
├── prisma/
│   └── schema.prisma             # Database schema
└── test-api-routes.js            # Test script
```

## ⚡ التثبيت السريع

### 1. تثبيت Dependencies
```bash
cd frontend
npm install
```

### 2. إعداد Prisma
```bash
npx prisma generate
```

### 3. إعداد Environment Variables
أنشئ ملف `.env.local` في مجلد `frontend`:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Environment
NODE_ENV="development"

# Upload Configuration (Optional)
UPLOAD_PATH="uploads"
MAX_FILE_SIZE="10485760"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/gif"
ALLOWED_VIDEO_TYPES="video/mp4,video/avi,video/mov"
ALLOWED_DOCUMENT_TYPES="application/pdf,application/msword"
```

### 4. تشغيل التطبيق
```bash
npm run dev
```

الآن يمكنك الوصول إلى API على: `http://localhost:3000/api`

## 🧪 الاختبار

### اختبار تلقائي
```bash
cd frontend
node test-api-routes.js
```

### اختبار يدوي

#### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### 3. Get Profile (مع Token)
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📋 جميع الـ Endpoints

### Authentication
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/profile` - الحصول على الملف الشخصي
- `POST /api/auth/logout` - تسجيل الخروج
- `POST /api/auth/create-admin` - إنشاء مسؤول

### Teacher
- `POST /api/teacher/registration/step/:step` - حفظ خطوة التسجيل
- `POST /api/teacher/registration/submit` - إرسال التسجيل
- `GET /api/teacher/registration/progress` - تقدم التسجيل
- `GET /api/teacher/dynamic-options` - خيارات ديناميكية
- `POST /api/teacher/upload` - رفع الملفات

### Admin (25+ endpoints)
- Dashboard, Teacher Applications, Dynamic Options, Students, Orders, Courses

### Student
- `POST /api/student/register` - تسجيل طالب
- `GET /api/student/materials` - المواد المتاحة
- `POST /api/student/form/step/:stepNumber` - حفظ خطوة النموذج

### Orders
- `POST /api/orders` - إنشاء طلب
- `GET /api/orders/student` - طلبات الطالب
- `GET /api/orders/teacher` - طلبات المعلم

### Courses
- `GET /api/course/public` - الدورات العامة
- `POST /api/course/create` - إنشاء دورة
- `GET /api/course/teacher` - دورات المعلم

### Pricing
- `GET /api/pricing` - جميع الباقات
- `POST /api/pricing` - إنشاء باقة (Admin)

للحصول على القائمة الكاملة، راجع: `NEXTJS_API_ROUTES_DOCUMENTATION.md`

## 🔐 المصادقة

جميع الـ endpoints المحمية تتطلب JWT token في header:

```
Authorization: Bearer <your_jwt_token>
```

### مستويات الصلاحيات:
- **Public** - متاح للجميع
- **Protected** - يتطلب تسجيل دخول
- **Admin Only** - صلاحيات مسؤول فقط
- **Teacher Only** - صلاحيات معلم فقط
- **Student Only** - صلاحيات طالب فقط

## 📊 Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

## 🔧 التخصيص

### إضافة Endpoint جديد

1. **أضف Controller** في `lib/controllers/your-controller.ts`
```typescript
export class YourController {
  static async yourMethod(req: any, res: any) {
    // Your logic here
  }
}
```

2. **أضف Route Handler** في `app/api/[...path]/route.ts`
```typescript
async function handleYourRoutes(request: NextRequest, segments: string[]) {
  // Handle your routes
}
```

3. **أضف في Main Handler**
```typescript
switch (mainRoute) {
  case "your-route":
    return handleYourRoutes(request, segments);
  // ...
}
```

## 🐛 استكشاف الأخطاء

### خطأ: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### خطأ: "Database connection failed"
تحقق من `DATABASE_URL` في `.env.local`

### خطأ: "JWT token invalid"
تحقق من `JWT_SECRET` في `.env.local`

### خطأ: "Module not found"
```bash
npm install
```

## 📚 الموارد

- [التوثيق الكامل](../NEXTJS_API_ROUTES_DOCUMENTATION.md)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)

## ✅ الميزات

- ✅ جميع endpoints محولة (90+ endpoint)
- ✅ Authentication و Authorization كاملة
- ✅ معالجة أخطاء شاملة
- ✅ TypeScript type safety
- ✅ Prisma ORM integration
- ✅ File upload support
- ✅ Validation schemas
- ✅ Test script included

## 🎯 الخطوات التالية

1. ✅ تثبيت Dependencies
2. ✅ إعداد Environment Variables
3. ✅ تشغيل Prisma Generate
4. ✅ تشغيل التطبيق
5. ✅ اختبار الـ Endpoints
6. 🔄 دمج مع Frontend Pages
7. 🔄 Deploy إلى Production

## 💡 ملاحظات مهمة

- **Database**: يجب أن تكون قاعدة البيانات متصلة ومُعدّة
- **Prisma Schema**: نفس schema من Backend
- **JWT Tokens**: نفس آلية التشفير من Backend
- **File Uploads**: الملفات تُحفظ في `uploads/` directory
- **CORS**: مُعدّ تلقائياً في Next.js

## 🤝 المساهمة

عند إضافة features جديدة:
1. أضف Controller و Service
2. أضف Validation schema
3. أضف Route handler
4. حدّث التوثيق
5. أضف اختبارات

---

**تم بنجاح! 🎉**

جميع API endpoints جاهزة للاستخدام في Next.js App Router.



