import {
  PrismaClient,
  UserRole,
  Gender,
  StudentType,
  InclusiveLearning,
  Curriculum,
  Grade,
  PreferredTime,
  PreferredTutor,
  SessionType,
  TeacherRole,
  EducationLevel,
  TutoringTime,
  TutoringMethod,
  Location,
  OrderStatus,
  OrderPriority,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================================
// SEED USERS
// ============================================================================
async function seedUsers() {
  console.log("👤 Seeding users...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@fikrtech.com" },
    update: {},
    create: {
      email: "admin@fikrtech.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Create teacher users
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const teachers: any[] = [];

  const teacherEmails = [
    "john.smith@teacher.com",
    "sarah.johnson@teacher.com",
    "ahmed.hassan@teacher.com",
    "maria.garcia@teacher.com",
    "david.brown@teacher.com",
  ];

  for (const email of teacherEmails) {
    const teacher = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: teacherPassword,
        role: UserRole.TEACHER,
        isActive: true,
      },
    });
    teachers.push(teacher);
  }

  // Create student users
  const studentPassword = await bcrypt.hash("student123", 10);
  const students: any[] = [];

  const studentEmails = [
    "alice.wonder@student.com",
    "bob.builder@student.com",
    "charlie.brown@student.com",
    "diana.prince@student.com",
    "ethan.hunt@student.com",
    "fiona.green@student.com",
    "george.wilson@student.com",
    "hannah.martin@student.com",
  ];

  for (const email of studentEmails) {
    const student = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: studentPassword,
        role: UserRole.STUDENT,
        isActive: true,
      },
    });
    students.push(student);
  }

  console.log(
    `  ✅ Created ${teachers.length} teachers, ${students.length} students, and 1 admin`
  );

  return { admin, teachers, students };
}

// ============================================================================
// SEED DYNAMIC OPTIONS
// ============================================================================
async function seedDynamicOptions() {
  console.log("⚙️ Seeding dynamic options...");

  // Clear existing tutoring options to avoid conflicts
  await prisma.dynamicOption.deleteMany({
    where: { parentRole: TeacherRole.TUTORING },
  });

  // TUTORING categories with proper structure for student form
  const tutoringCategories = [
    {
      name: "Math",
      description:
        "Mathematics subjects including Algebra, Calculus, Geometry, Statistics",
      subcategories: [
        { name: "Algebra", description: "Elementary and advanced algebra" },
        { name: "Calculus", description: "Differential and integral calculus" },
        { name: "Geometry", description: "Plane and solid geometry" },
        { name: "Statistics", description: "Statistics and probability" },
        {
          name: "Trigonometry",
          description: "Trigonometric functions and identities",
        },
        {
          name: "Linear Algebra",
          description: "Vector spaces and linear transformations",
        },
      ],
    },
    {
      name: "Science",
      description: "Natural sciences including Physics, Chemistry, Biology",
      subcategories: [
        {
          name: "Physics",
          description: "Mechanics, thermodynamics, electromagnetism",
        },
        {
          name: "Chemistry",
          description: "Organic, inorganic, and physical chemistry",
        },
        {
          name: "Biology",
          description: "Molecular biology, genetics, ecology",
        },
        {
          name: "Earth Science",
          description: "Geology, meteorology, astronomy",
        },
        {
          name: "Environmental Science",
          description: "Environmental studies and sustainability",
        },
      ],
    },
    {
      name: "Languages",
      description: "Language learning and literature",
      subcategories: [
        { name: "English", description: "English language and literature" },
        { name: "Arabic", description: "Arabic language and literature" },
        { name: "French", description: "French language and culture" },
        { name: "Spanish", description: "Spanish language and culture" },
        { name: "German", description: "German language and culture" },
        { name: "Chinese", description: "Mandarin Chinese language" },
      ],
    },
    {
      name: "Computer Science",
      description: "Programming and computer science",
      subcategories: [
        {
          name: "Programming Basics",
          description: "Introduction to programming concepts",
        },
        {
          name: "Web Development",
          description: "HTML, CSS, JavaScript, and frameworks",
        },
        {
          name: "Data Structures",
          description: "Arrays, lists, trees, graphs",
        },
        {
          name: "Algorithms",
          description: "Sorting, searching, and optimization",
        },
        { name: "Database Design", description: "SQL and database management" },
        {
          name: "Mobile Development",
          description: "iOS and Android app development",
        },
      ],
    },
    {
      name: "Business Studies",
      description: "Business and economics subjects",
      subcategories: [
        { name: "Economics", description: "Micro and macroeconomics" },
        {
          name: "Accounting",
          description: "Financial and management accounting",
        },
        {
          name: "Marketing",
          description: "Marketing principles and digital marketing",
        },
        {
          name: "Entrepreneurship",
          description: "Business planning and startup guidance",
        },
        {
          name: "Finance",
          description: "Corporate finance and investment analysis",
        },
        {
          name: "Management",
          description: "Business management and leadership",
        },
      ],
    },
    {
      name: "Social Studies",
      description: "History, Geography, and Social Sciences",
      subcategories: [
        {
          name: "History",
          description: "World history and historical analysis",
        },
        { name: "Geography", description: "Physical and human geography" },
        {
          name: "Political Science",
          description: "Government and political systems",
        },
        {
          name: "Psychology",
          description: "Human behavior and mental processes",
        },
        { name: "Sociology", description: "Social behavior and society" },
      ],
    },
  ];

  for (const category of tutoringCategories) {
    // Create parent category
    const parentCategory = await prisma.dynamicOption.create({
      data: {
        parentRole: TeacherRole.TUTORING,
        parentId: null,
        name: category.name,
        description: category.description,
        isActive: true,
        sortOrder: tutoringCategories.indexOf(category),
      },
    });

    // Create subcategories
    for (const subcategory of category.subcategories) {
      await prisma.dynamicOption.create({
        data: {
          parentRole: TeacherRole.TUTORING,
          parentId: parentCategory.id,
          name: subcategory.name,
          description: subcategory.description,
          isActive: true,
          sortOrder: category.subcategories.indexOf(subcategory),
        },
      });
    }
  }

  // TEACHING options
  const projectOptions = [
    {
      name: "Web Development",
      description: "Frontend, Backend, Full-stack projects",
    },
    { name: "Mobile Apps", description: "iOS, Android, React Native projects" },
    { name: "Data Analysis", description: "Python, R, SQL data projects" },
    {
      name: "AI/ML Projects",
      description: "Machine Learning, Deep Learning projects",
    },
    { name: "Design Projects", description: "UI/UX, Graphic Design projects" },
  ];

  for (const option of projectOptions) {
    await prisma.dynamicOption.upsert({
      where: {
        id: `projects-${option.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      },
      update: {},
      create: {
        id: `projects-${option.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        parentRole: TeacherRole.TEACHING,
        name: option.name,
        description: option.description,
        isActive: true,
        sortOrder: projectOptions.indexOf(option),
      },
    });
  }

  // COURSING options
  const courseOptions = [
    {
      name: "Programming Courses",
      description: "Python, JavaScript, Java, C++",
    },
    {
      name: "Business Courses",
      description: "MBA, Marketing, Finance courses",
    },
    {
      name: "Language Courses",
      description: "English, Arabic, French courses",
    },
    {
      name: "Design Courses",
      description: "Photoshop, Illustrator, Figma courses",
    },
    {
      name: "Digital Marketing",
      description: "SEO, Social Media, Content Marketing",
    },
  ];

  for (const option of courseOptions) {
    await prisma.dynamicOption.upsert({
      where: {
        id: `course-${option.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      },
      update: {},
      create: {
        id: `course-${option.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        parentRole: TeacherRole.COURSING,
        name: option.name,
        description: option.description,
        isActive: true,
        sortOrder: courseOptions.indexOf(option),
      },
    });
  }

  // COACHING options
  const coachingOptions = [
    { name: "Career Coaching", description: "Career development and guidance" },
    {
      name: "Life Coaching",
      description: "Personal development and life skills",
    },
    {
      name: "Academic Coaching",
      description: "Study skills and academic success",
    },
    {
      name: "Leadership Coaching",
      description: "Leadership skills development",
    },
    {
      name: "Interview Preparation",
      description: "Job interview skills and preparation",
    },
  ];

  for (const option of coachingOptions) {
    await prisma.dynamicOption.upsert({
      where: {
        id: `coaching-${option.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      },
      update: {},
      create: {
        id: `coaching-${option.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        parentRole: TeacherRole.COACHING,
        name: option.name,
        description: option.description,
        isActive: true,
        sortOrder: coachingOptions.indexOf(option),
      },
    });
  }

  console.log("  ✅ Created dynamic options for all teacher roles");
}

// ============================================================================
// SEED TEACHERS
// ============================================================================
async function seedTeachers(userData: {
  admin: any;
  teachers: any[];
  students: any[];
}) {
  console.log("👨‍🏫 Seeding teachers...");

  const teacherProfiles = [
    {
      fullName: "John Smith",
      gender: Gender.MALE,
      nationality: "American",
      dateOfBirth: new Date("1985-03-15"),
      age: 38,
      phone: "+971-50-1234567",
      universityAffiliation: "MIT",
      highestEducation: EducationLevel.PHD,
      yearsExperience: 12,
      languagesSpoken: JSON.stringify(["English", "Arabic"]),
      shortBio:
        "Experienced computer science professor with expertise in algorithms and data structures. Passionate about helping students understand complex programming concepts.",
      preferredTutoringTime: TutoringTime.FLEXIBLE,
      preferredTutoringMethod: TutoringMethod.ONLINE,
      location: Location.UAE,
      proposedHourlyRate: 150.0,
      agreedToTerms: true,
      isApproved: true,
      roles: [TeacherRole.TUTORING, TeacherRole.COURSING],
      subOptions: ["tutoring-computer-science", "course-programming-courses"],
    },
    {
      fullName: "Sarah Johnson",
      gender: Gender.FEMALE,
      nationality: "British",
      dateOfBirth: new Date("1990-07-22"),
      age: 33,
      phone: "+971-50-2345678",
      universityAffiliation: "Oxford University",
      highestEducation: EducationLevel.MASTER,
      yearsExperience: 8,
      languagesSpoken: JSON.stringify(["English", "French"]),
      shortBio:
        "Mathematics educator with a passion for making complex mathematical concepts accessible to students of all levels.",
      preferredTutoringTime: TutoringTime.WEEKDAYS,
      preferredTutoringMethod: TutoringMethod.ONLINE,
      location: Location.UAE,
      proposedHourlyRate: 120.0,
      agreedToTerms: true,
      isApproved: true,
      roles: [TeacherRole.TUTORING, TeacherRole.TEACHING],
      subOptions: ["tutoring-mathematics", "math-calculus", "math-algebra"],
    },
    {
      fullName: "Ahmed Hassan",
      gender: Gender.MALE,
      nationality: "Egyptian",
      dateOfBirth: new Date("1988-11-10"),
      age: 35,
      phone: "+971-50-3456789",
      universityAffiliation: "American University of Cairo",
      highestEducation: EducationLevel.MBA,
      yearsExperience: 10,
      languagesSpoken: JSON.stringify(["Arabic", "English"]),
      shortBio:
        "Business consultant and educator specializing in digital marketing and entrepreneurship.",
      preferredTutoringTime: TutoringTime.WEEKENDS,
      preferredTutoringMethod: TutoringMethod.PHYSICAL,
      location: Location.UAE,
      proposedHourlyRate: 100.0,
      agreedToTerms: true,
      isApproved: true,
      roles: [TeacherRole.COACHING, TeacherRole.COURSING],
      subOptions: ["coaching-career-coaching", "course-digital-marketing"],
    },
    {
      fullName: "Maria Garcia",
      gender: Gender.FEMALE,
      nationality: "Spanish",
      dateOfBirth: new Date("1992-04-18"),
      age: 31,
      phone: "+971-50-4567890",
      universityAffiliation: "Universidad Complutense Madrid",
      highestEducation: EducationLevel.MASTER,
      yearsExperience: 6,
      languagesSpoken: JSON.stringify(["Spanish", "English", "Arabic"]),
      shortBio:
        "Language instructor specializing in Spanish and English. Expert in interactive teaching methods.",
      preferredTutoringTime: TutoringTime.FLEXIBLE,
      preferredTutoringMethod: TutoringMethod.ONLINE,
      location: Location.UAE,
      proposedHourlyRate: 80.0,
      agreedToTerms: true,
      isApproved: false, // Pending approval
      roles: [TeacherRole.TUTORING, TeacherRole.COURSING],
      subOptions: ["tutoring-languages", "course-language-courses"],
    },
    {
      fullName: "David Brown",
      gender: Gender.MALE,
      nationality: "Canadian",
      dateOfBirth: new Date("1987-09-05"),
      age: 36,
      phone: "+971-50-5678901",
      universityAffiliation: "University of Toronto",
      highestEducation: EducationLevel.PHD,
      yearsExperience: 11,
      languagesSpoken: JSON.stringify(["English", "French"]),
      shortBio:
        "Data scientist and AI researcher with extensive experience in machine learning and data analysis.",
      preferredTutoringTime: TutoringTime.WEEKDAYS,
      preferredTutoringMethod: TutoringMethod.ONLINE,
      location: Location.UAE,
      proposedHourlyRate: 180.0,
      agreedToTerms: true,
      isApproved: true,
      roles: [TeacherRole.TEACHING, TeacherRole.COURSING],
      subOptions: ["projects-ai-ml-projects", "projects-data-analysis"],
    },
  ];

  for (
    let i = 0;
    i < teacherProfiles.length && i < userData.teachers.length;
    i++
  ) {
    const profile = teacherProfiles[i];
    const user = userData.teachers[i];

    // Create teacher profile
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: profile.fullName,
        gender: profile.gender,
        nationality: profile.nationality,
        dateOfBirth: profile.dateOfBirth,
        age: profile.age,
        phone: profile.phone,
        universityAffiliation: profile.universityAffiliation,
        highestEducation: profile.highestEducation,
        yearsExperience: profile.yearsExperience,
        languagesSpoken: profile.languagesSpoken,
        shortBio: profile.shortBio,
        preferredTutoringTime: profile.preferredTutoringTime,
        preferredTutoringMethod: profile.preferredTutoringMethod,
        location: profile.location,
        proposedHourlyRate: profile.proposedHourlyRate,
        agreedToTerms: profile.agreedToTerms,
        isApproved: profile.isApproved,
      },
    });

    // Create teacher role selections
    for (const role of profile.roles) {
      await prisma.teacherRoleSelection.upsert({
        where: {
          teacherId_role: {
            teacherId: teacher.id,
            role: role,
          },
        },
        update: {},
        create: {
          teacherId: teacher.id,
          role: role,
        },
      });
    }

    // Create teacher sub-option selections
    for (const optionId of profile.subOptions) {
      try {
        // Check if the option exists first
        const option = await prisma.dynamicOption.findUnique({
          where: { id: optionId },
        });

        if (option) {
          await prisma.teacherSubOptionSelection.upsert({
            where: {
              teacherId_optionId: {
                teacherId: teacher.id,
                optionId: optionId,
              },
            },
            update: {},
            create: {
              teacherId: teacher.id,
              optionId: optionId,
            },
          });
        } else {
          console.log(`  ⚠️ Option ${optionId} not found, skipping...`);
        }
      } catch (error) {
        console.log(
          `  ⚠️ Error creating sub-option selection for ${optionId}:`,
          error
        );
      }
    }

    // Create teacher application if not approved
    if (!profile.isApproved) {
      await prisma.teacherApplication.upsert({
        where: { teacherId: teacher.id },
        update: {},
        create: {
          teacherId: teacher.id,
          applicationData: {
            fullName: profile.fullName,
            gender: profile.gender,
            nationality: profile.nationality,
            dateOfBirth: profile.dateOfBirth.toISOString(),
            phone: profile.phone,
            universityAffiliation: profile.universityAffiliation,
            highestEducation: profile.highestEducation,
            yearsExperience: profile.yearsExperience,
            shortBio: profile.shortBio,
            proposedHourlyRate: profile.proposedHourlyRate,
            selectedRoles: profile.roles,
            selectedOptions: profile.subOptions,
          },
        },
      });
    }
  }

  console.log(
    `  ✅ Created ${teacherProfiles.length} teacher profiles with relationships`
  );
}

// ============================================================================
// SEED TUTORING PACKAGES
// ============================================================================
async function seedTutoringPackages() {
  console.log("📦 Seeding tutoring packages...");

  const packages = [
    {
      title: "Free Package",
      level: "SCHOOL" as const,
      mode: "ONLINE" as const,
      paidHours: 0,
      freeSessions: 2,
      totalHours: 2,
      priceAED: 0,
      effectiveRateAED: 0,
      shortNote: "Get started with our basic features",
      isActive: true,
    },
    {
      title: "Starter Package",
      level: "SCHOOL" as const,
      mode: "ONLINE" as const,
      paidHours: 10,
      freeSessions: 2,
      totalHours: 12,
      priceAED: 200,
      effectiveRateAED: 16.67,
      shortNote: "Perfect for small businesses and startups",
      isActive: true,
    },
    {
      title: "Pro Package",
      level: "UNIVERSITY" as const,
      mode: "OFFLINE" as const,
      paidHours: 20,
      freeSessions: 3,
      totalHours: 23,
      priceAED: 500,
      effectiveRateAED: 21.74,
      shortNote: "Ideal for growing businesses and enterprises",
      isActive: true,
    },
    {
      title: "Enterprise Package",
      level: "UNIVERSITY" as const,
      mode: "OFFLINE" as const,
      paidHours: 50,
      freeSessions: 5,
      totalHours: 55,
      priceAED: 1000,
      effectiveRateAED: 18.18,
      shortNote: "Tailored for large-scale deployments and custom needs",
      isActive: true,
    },
    {
      title: "School Online Premium",
      level: "SCHOOL" as const,
      mode: "ONLINE" as const,
      paidHours: 15,
      freeSessions: 3,
      totalHours: 18,
      priceAED: 300,
      effectiveRateAED: 16.67,
      shortNote: "Premium online package for school students",
      isActive: true,
    },
    {
      title: "University Online Standard",
      level: "UNIVERSITY" as const,
      mode: "ONLINE" as const,
      paidHours: 25,
      freeSessions: 4,
      totalHours: 29,
      priceAED: 600,
      effectiveRateAED: 20.69,
      shortNote: "Standard online package for university students",
      isActive: true,
    },
  ];

  // Clear existing packages
  await prisma.tutoringPackage.deleteMany({});

  // Create new packages
  for (const pkg of packages) {
    await prisma.tutoringPackage.create({
      data: pkg,
    });
  }

  console.log(`  ✅ Created ${packages.length} tutoring packages`);
}

// ============================================================================
// SEED STUDENTS
// ============================================================================
async function seedStudents(userData: {
  admin: any;
  teachers: any[];
  students: any[];
}) {
  console.log("👥 Seeding students...");

  const studentProfiles = [
    {
      fullName: "Alice Wonder",
      gender: Gender.FEMALE,
      nationality: "American",
      dateOfBirth: new Date("2008-03-15"),
      age: 15,
      phone: "+971-50-1000000",
    },
    {
      fullName: "Bob Builder",
      gender: Gender.MALE,
      nationality: "British",
      dateOfBirth: new Date("2009-07-22"),
      age: 14,
      phone: "+971-50-1000001",
    },
    {
      fullName: "Charlie Brown",
      gender: Gender.MALE,
      nationality: "Canadian",
      dateOfBirth: new Date("2007-11-10"),
      age: 16,
      phone: "+971-50-1000002",
    },
    {
      fullName: "Diana Prince",
      gender: Gender.FEMALE,
      nationality: "Lebanese",
      dateOfBirth: new Date("2008-04-18"),
      age: 15,
      phone: "+971-50-1000003",
    },
    {
      fullName: "Ethan Hunt",
      gender: Gender.MALE,
      nationality: "Emirati",
      dateOfBirth: new Date("2006-09-05"),
      age: 17,
      phone: "+971-50-1000004",
    },
    {
      fullName: "Fiona Green",
      gender: Gender.FEMALE,
      nationality: "Australian",
      dateOfBirth: new Date("2007-12-03"),
      age: 16,
      phone: "+971-50-1000005",
    },
    {
      fullName: "George Wilson",
      gender: Gender.MALE,
      nationality: "South African",
      dateOfBirth: new Date("2008-06-20"),
      age: 15,
      phone: "+971-50-1000006",
    },
    {
      fullName: "Hannah Martin",
      gender: Gender.FEMALE,
      nationality: "German",
      dateOfBirth: new Date("2006-08-14"),
      age: 17,
      phone: "+971-50-1000007",
    },
  ];

  // Get tutoring categories for form responses
  const tutoringCategories = await prisma.dynamicOption.findMany({
    where: {
      parentRole: TeacherRole.TUTORING,
      parentId: null,
    },
    include: {
      children: true,
    },
  });

  const mathCategory = tutoringCategories.find((cat) => cat.name === "Math");
  const scienceCategory = tutoringCategories.find(
    (cat) => cat.name === "Science"
  );
  const languagesCategory = tutoringCategories.find(
    (cat) => cat.name === "Languages"
  );
  const csCategory = tutoringCategories.find(
    (cat) => cat.name === "Computer Science"
  );
  const businessCategory = tutoringCategories.find(
    (cat) => cat.name === "Business Studies"
  );

  for (let i = 0; i < userData.students.length; i++) {
    const profile = studentProfiles[i];

    const student = await prisma.student.upsert({
      where: { userId: userData.students[i].id },
      update: {},
      create: {
        userId: userData.students[i].id,
        fullName: profile.fullName,
        gender: profile.gender,
        nationality: profile.nationality,
        dateOfBirth: profile.dateOfBirth,
        age: profile.age,
        phone: profile.phone,
        isFormCompleted: true,
      },
    });

    // Create student form responses with new structure
    const formResponses = [
      {
        studentType: StudentType.STUDENT,
        inclusiveLearning: InclusiveLearning.NONE,
        formGender: Gender.FEMALE,
        curriculum: Curriculum.AMERICAN_SYSTEM,
        grade: Grade.GRADE10,
        selectedCategories: JSON.stringify([mathCategory?.id || ""]),
        selectedSubcategories: JSON.stringify([
          mathCategory?.children[0]?.id || "",
          mathCategory?.children[1]?.id || "",
        ]),
        preferredTime: PreferredTime.WEEKDAYS,
        preferredTutor: PreferredTutor.FEMALE_TUTOR,
        sessionType: SessionType.ONLINE_SESSIONS,
      },
      {
        studentType: StudentType.PARENT,
        inclusiveLearning: InclusiveLearning.ADHD,
        formGender: Gender.MALE,
        curriculum: Curriculum.BRITISH_SYSTEM,
        grade: Grade.GRADE9,
        selectedCategories: JSON.stringify([
          csCategory?.id || "",
          scienceCategory?.id || "",
        ]),
        selectedSubcategories: JSON.stringify([
          csCategory?.children[0]?.id || "",
          csCategory?.children[1]?.id || "",
          scienceCategory?.children[0]?.id || "",
        ]),
        preferredTime: PreferredTime.WEEKEND,
        preferredTutor: PreferredTutor.MALE_TUTOR,
        sessionType: SessionType.OFFLINE_SESSIONS,
      },
      {
        studentType: StudentType.STUDENT,
        inclusiveLearning: InclusiveLearning.NONE,
        formGender: Gender.MALE,
        curriculum: Curriculum.IB_SYSTEM,
        grade: Grade.GRADE11,
        selectedCategories: JSON.stringify([
          scienceCategory?.id || "",
          languagesCategory?.id || "",
        ]),
        selectedSubcategories: JSON.stringify([
          scienceCategory?.children[0]?.id || "",
          scienceCategory?.children[1]?.id || "",
          languagesCategory?.children[0]?.id || "",
        ]),
        preferredTime: PreferredTime.WEEKDAYS,
        preferredTutor: PreferredTutor.BOTH,
        sessionType: SessionType.ONLINE_SESSIONS,
      },
      {
        studentType: StudentType.PARENT,
        inclusiveLearning: InclusiveLearning.DYSLEXIA,
        formGender: Gender.FEMALE,
        curriculum: Curriculum.FRENCH_SYSTEM,
        grade: Grade.GRADE10,
        selectedCategories: JSON.stringify([languagesCategory?.id || ""]),
        selectedSubcategories: JSON.stringify([
          languagesCategory?.children[0]?.id || "",
          languagesCategory?.children[1]?.id || "",
        ]),
        preferredTime: PreferredTime.WEEKEND,
        preferredTutor: PreferredTutor.FEMALE_TUTOR,
        sessionType: SessionType.ONLINE_SESSIONS,
      },
      {
        studentType: StudentType.STUDENT,
        inclusiveLearning: InclusiveLearning.NONE,
        formGender: Gender.MALE,
        curriculum: Curriculum.NATIONAL_SYSTEM,
        grade: Grade.GRADE12,
        selectedCategories: JSON.stringify([businessCategory?.id || ""]),
        selectedSubcategories: JSON.stringify([
          businessCategory?.children[0]?.id || "",
          businessCategory?.children[1]?.id || "",
        ]),
        preferredTime: PreferredTime.WEEKDAYS,
        preferredTutor: PreferredTutor.BOTH,
        sessionType: SessionType.ONLINE_SESSIONS,
      },
      {
        studentType: StudentType.STUDENT,
        inclusiveLearning: InclusiveLearning.DYSCALCULIA,
        formGender: Gender.FEMALE,
        curriculum: Curriculum.AMERICAN_SYSTEM,
        grade: Grade.GRADE9,
        selectedCategories: JSON.stringify([mathCategory?.id || ""]),
        selectedSubcategories: JSON.stringify([
          mathCategory?.children[2]?.id || "",
          mathCategory?.children[3]?.id || "",
        ]),
        preferredTime: PreferredTime.WEEKEND,
        preferredTutor: PreferredTutor.FEMALE_TUTOR,
        sessionType: SessionType.ONLINE_SESSIONS,
      },
      {
        studentType: StudentType.PARENT,
        inclusiveLearning: InclusiveLearning.NONE,
        formGender: Gender.MALE,
        curriculum: Curriculum.BRITISH_SYSTEM,
        grade: Grade.GRADE11,
        selectedCategories: JSON.stringify([scienceCategory?.id || ""]),
        selectedSubcategories: JSON.stringify([
          scienceCategory?.children[2]?.id || "",
          scienceCategory?.children[3]?.id || "",
        ]),
        preferredTime: PreferredTime.WEEKDAYS,
        preferredTutor: PreferredTutor.MALE_TUTOR,
        sessionType: SessionType.OFFLINE_SESSIONS,
      },
      {
        studentType: StudentType.STUDENT,
        inclusiveLearning: InclusiveLearning.NONE,
        formGender: Gender.FEMALE,
        curriculum: Curriculum.IB_SYSTEM,
        grade: Grade.GRADE10,
        selectedCategories: JSON.stringify([languagesCategory?.id || ""]),
        selectedSubcategories: JSON.stringify([
          languagesCategory?.children[2]?.id || "",
          languagesCategory?.children[3]?.id || "",
        ]),
        preferredTime: PreferredTime.WEEKDAYS,
        preferredTutor: PreferredTutor.BOTH,
        sessionType: SessionType.ONLINE_SESSIONS,
      },
    ];

    await prisma.studentFormResponse.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        studentId: student.id,
        ...formResponses[i],
        currentStep: 10, // Updated to 10 steps
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  console.log(
    `  ✅ Created ${userData.students.length} students with completed forms`
  );
}

// ============================================================================
// SEED ORDERS
// ============================================================================
async function seedOrders(userData: {
  admin: any;
  teachers: any[];
  students: any[];
}) {
  console.log("📝 Seeding orders...");

  // Get student and teacher data from database
  const students = await prisma.student.findMany({
    include: { user: true },
  });

  const teachers = await prisma.teacher.findMany({
    where: { isApproved: true },
    include: { user: true },
  });

  if (students.length === 0 || teachers.length === 0) {
    console.log(
      "  ⚠️ No students or approved teachers found, skipping order seeding"
    );
    return;
  }

  const orderData = [
    {
      title: "Mathematics Tutoring - Calculus",
      description:
        "Need help with advanced calculus concepts and problem solving techniques.",
      subject: "Mathematics",
      grade: Grade.GRADE11,
      curriculum: Curriculum.AMERICAN_SYSTEM,
      sessionType: SessionType.ONLINE_SESSIONS,
      preferredTime: PreferredTime.WEEKDAYS,
      sessionsPerWeek: 2,
      sessionDuration: 90,
      totalSessions: 20,
      proposedRate: 120.0,
      agreedRate: 120.0,
      totalAmount: 2400.0,
      status: OrderStatus.IN_PROGRESS,
      priority: OrderPriority.HIGH,
      preferredStartDate: new Date("2024-10-01"),
      actualStartDate: new Date("2024-10-01"),
      estimatedEndDate: new Date("2024-12-15"),
      requirements: "Focus on AP Calculus preparation",
      studentNotes: "Struggling with integration techniques",
      teacherNotes:
        "Student shows good understanding of basics, needs practice with complex problems",
    },
    {
      title: "Computer Science Project Help",
      description:
        "Need assistance with Python programming project for school.",
      subject: "Computer Science",
      grade: Grade.GRADE10,
      curriculum: Curriculum.BRITISH_SYSTEM,
      sessionType: SessionType.OFFLINE_SESSIONS,
      preferredTime: PreferredTime.WEEKEND,
      sessionsPerWeek: 1,
      sessionDuration: 120,
      totalSessions: 8,
      location: "Dubai Marina",
      address: "Dubai Marina Mall, Meeting Room 3",
      proposedRate: 150.0,
      agreedRate: 140.0,
      totalAmount: 1120.0,
      status: OrderStatus.COMPLETED,
      priority: OrderPriority.MEDIUM,
      preferredStartDate: new Date("2024-09-01"),
      actualStartDate: new Date("2024-09-05"),
      estimatedEndDate: new Date("2024-10-30"),
      actualEndDate: new Date("2024-10-28"),
      requirements: "Web development project using Python Flask",
      specialNeeds: "Student has ADHD, needs structured breaks",
      studentNotes: "Want to build a personal portfolio website",
      teacherNotes: "Project completed successfully, student very engaged",
      adminNotes: "Excellent feedback from both parties",
    },
    {
      title: "French Language Tutoring",
      description:
        "Beginner level French language learning for international curriculum.",
      subject: "French",
      grade: Grade.GRADE9,
      curriculum: Curriculum.IB_SYSTEM,
      sessionType: SessionType.ONLINE_SESSIONS,
      preferredTime: PreferredTime.WEEKDAYS,
      sessionsPerWeek: 3,
      sessionDuration: 60,
      proposedRate: 80.0,
      status: OrderStatus.PENDING,
      priority: OrderPriority.LOW,
      preferredStartDate: new Date("2024-11-01"),
      requirements: "Conversational French focus",
      studentNotes: "Complete beginner, need patient teacher",
    },
    {
      title: "Business Studies Coaching",
      description: "Career guidance and business fundamentals coaching.",
      subject: "Business Studies",
      grade: Grade.GRADE12,
      curriculum: Curriculum.AMERICAN_SYSTEM,
      sessionType: SessionType.ONLINE_SESSIONS,
      preferredTime: PreferredTime.WEEKEND,
      sessionsPerWeek: 1,
      sessionDuration: 90,
      totalSessions: 12,
      proposedRate: 100.0,
      agreedRate: 95.0,
      totalAmount: 1140.0,
      status: OrderStatus.CONFIRMED,
      priority: OrderPriority.HIGH,
      preferredStartDate: new Date("2024-10-15"),
      estimatedEndDate: new Date("2024-12-31"),
      requirements: "Focus on entrepreneurship and business plan development",
      studentNotes: "Planning to start own business after graduation",
      teacherNotes:
        "Student has great business ideas, needs guidance on execution",
    },
    {
      title: "Physics Problem Solving",
      description: "Advanced physics concepts and problem-solving techniques.",
      subject: "Physics",
      grade: Grade.GRADE11,
      curriculum: Curriculum.BRITISH_SYSTEM,
      sessionType: SessionType.ONLINE_SESSIONS,
      preferredTime: PreferredTime.WEEKDAYS,
      sessionsPerWeek: 2,
      sessionDuration: 75,
      proposedRate: 110.0,
      status: OrderStatus.REJECTED,
      priority: OrderPriority.MEDIUM,
      preferredStartDate: new Date("2024-09-15"),
      requirements: "A-Level Physics preparation",
      studentNotes: "Need help with mechanics and thermodynamics",
      adminNotes: "Teacher unavailable for requested time slots",
    },
  ];

  const createdOrders: any[] = [];

  for (
    let i = 0;
    i < Math.min(orderData.length, students.length, teachers.length);
    i++
  ) {
    const order = orderData[i];
    const student = students[i];
    const teacher = teachers[i % teachers.length]; // Cycle through teachers if fewer than orders

    const createdOrder = await prisma.order.upsert({
      where: {
        id: `order-${i + 1}`,
      },
      update: {},
      create: {
        id: `order-${i + 1}`,
        studentId: student.id,
        teacherId: teacher.id,
        title: order.title,
        description: order.description,
        subject: order.subject,
        grade: order.grade,
        curriculum: order.curriculum,
        sessionType: order.sessionType,
        preferredTime: order.preferredTime,
        sessionsPerWeek: order.sessionsPerWeek,
        sessionDuration: order.sessionDuration,
        totalSessions: order.totalSessions,
        location: order.location,
        address: order.address,
        proposedRate: order.proposedRate,
        agreedRate: order.agreedRate,
        totalAmount: order.totalAmount,
        status: order.status,
        priority: order.priority,
        preferredStartDate: order.preferredStartDate,
        actualStartDate: order.actualStartDate,
        estimatedEndDate: order.estimatedEndDate,
        actualEndDate: order.actualEndDate,
        requirements: order.requirements,
        specialNeeds: order.specialNeeds,
        studentNotes: order.studentNotes,
        teacherNotes: order.teacherNotes,
        adminNotes: order.adminNotes,
      },
    });

    createdOrders.push(createdOrder);

    // Create order history
    const statusProgression = getStatusProgression(order.status);
    for (let j = 0; j < statusProgression.length; j++) {
      const historyEntry = statusProgression[j];
      await prisma.orderHistory.create({
        data: {
          orderId: createdOrder.id,
          previousStatus: historyEntry.previousStatus,
          newStatus: historyEntry.newStatus,
          changedBy:
            historyEntry.changedBy === "student"
              ? student.userId
              : historyEntry.changedBy === "teacher"
              ? teacher.userId
              : userData.admin.id,
          changeReason: historyEntry.reason,
          metadata: historyEntry.metadata || {},
          createdAt: new Date(
            Date.now() - (statusProgression.length - j) * 24 * 60 * 60 * 1000
          ),
        },
      });
    }

    // Create order messages
    const messages = getOrderMessages(
      order.status,
      student.userId,
      teacher.userId,
      userData.admin.id
    );
    for (let k = 0; k < messages.length; k++) {
      const message = messages[k];
      await prisma.orderMessage.create({
        data: {
          orderId: createdOrder.id,
          senderId: message.senderId,
          senderRole: message.senderRole,
          message: message.message,
          isRead: message.isRead,
          readAt: message.isRead
            ? new Date(Date.now() - (messages.length - k) * 2 * 60 * 60 * 1000)
            : null,
          createdAt: new Date(
            Date.now() - (messages.length - k) * 3 * 60 * 60 * 1000
          ),
        },
      });
    }
  }

  console.log(
    `  ✅ Created ${createdOrders.length} orders with history and messages`
  );
}

function getStatusProgression(currentStatus: OrderStatus) {
  const baseProgression = [
    {
      previousStatus: null,
      newStatus: OrderStatus.PENDING,
      changedBy: "student",
      reason: "Order created by student",
      metadata: { action: "order_created" },
    },
  ];

  switch (currentStatus) {
    case OrderStatus.CONFIRMED:
      return [
        ...baseProgression,
        {
          previousStatus: OrderStatus.PENDING,
          newStatus: OrderStatus.CONFIRMED,
          changedBy: "teacher",
          reason: "Teacher accepted the order",
          metadata: { action: "teacher_accepted" },
        },
      ];

    case OrderStatus.IN_PROGRESS:
      return [
        ...baseProgression,
        {
          previousStatus: OrderStatus.PENDING,
          newStatus: OrderStatus.CONFIRMED,
          changedBy: "teacher",
          reason: "Teacher accepted the order",
          metadata: { action: "teacher_accepted" },
        },
        {
          previousStatus: OrderStatus.CONFIRMED,
          newStatus: OrderStatus.IN_PROGRESS,
          changedBy: "admin",
          reason: "Sessions started",
          metadata: { action: "sessions_started" },
        },
      ];

    case OrderStatus.COMPLETED:
      return [
        ...baseProgression,
        {
          previousStatus: OrderStatus.PENDING,
          newStatus: OrderStatus.CONFIRMED,
          changedBy: "teacher",
          reason: "Teacher accepted the order",
          metadata: { action: "teacher_accepted" },
        },
        {
          previousStatus: OrderStatus.CONFIRMED,
          newStatus: OrderStatus.IN_PROGRESS,
          changedBy: "admin",
          reason: "Sessions started",
          metadata: { action: "sessions_started" },
        },
        {
          previousStatus: OrderStatus.IN_PROGRESS,
          newStatus: OrderStatus.COMPLETED,
          changedBy: "teacher",
          reason: "All sessions completed successfully",
          metadata: { action: "order_completed", rating: 5 },
        },
      ];

    case OrderStatus.REJECTED:
      return [
        ...baseProgression,
        {
          previousStatus: OrderStatus.PENDING,
          newStatus: OrderStatus.REJECTED,
          changedBy: "admin",
          reason: "Teacher unavailable for requested time slots",
          metadata: { action: "admin_rejected" },
        },
      ];

    case OrderStatus.CANCELLED:
      return [
        ...baseProgression,
        {
          previousStatus: OrderStatus.PENDING,
          newStatus: OrderStatus.CONFIRMED,
          changedBy: "teacher",
          reason: "Teacher accepted the order",
          metadata: { action: "teacher_accepted" },
        },
        {
          previousStatus: OrderStatus.CONFIRMED,
          newStatus: OrderStatus.CANCELLED,
          changedBy: "student",
          reason: "Student cancelled due to schedule conflict",
          metadata: { action: "student_cancelled" },
        },
      ];

    default:
      return baseProgression;
  }
}

function getOrderMessages(
  status: OrderStatus,
  studentId: string,
  teacherId: string,
  adminId: string
) {
  const baseMessages = [
    {
      senderId: studentId,
      senderRole: UserRole.STUDENT,
      message:
        "Hi, I'm looking for help with this subject. When would be a good time to start?",
      isRead: true,
    },
  ];

  switch (status) {
    case OrderStatus.CONFIRMED:
      return [
        ...baseMessages,
        {
          senderId: teacherId,
          senderRole: UserRole.TEACHER,
          message:
            "Hello! I'd be happy to help you with this subject. I'm available for the times you mentioned.",
          isRead: true,
        },
        {
          senderId: studentId,
          senderRole: UserRole.STUDENT,
          message: "Great! When can we schedule our first session?",
          isRead: false,
        },
      ];

    case OrderStatus.IN_PROGRESS:
      return [
        ...baseMessages,
        {
          senderId: teacherId,
          senderRole: UserRole.TEACHER,
          message:
            "Hello! I'd be happy to help you with this subject. I'm available for the times you mentioned.",
          isRead: true,
        },
        {
          senderId: adminId,
          senderRole: UserRole.ADMIN,
          message:
            "Your sessions have been scheduled. Please check your calendar for upcoming sessions.",
          isRead: true,
        },
        {
          senderId: studentId,
          senderRole: UserRole.STUDENT,
          message: "Thank you! Looking forward to our sessions.",
          isRead: true,
        },
      ];

    case OrderStatus.COMPLETED:
      return [
        ...baseMessages,
        {
          senderId: teacherId,
          senderRole: UserRole.TEACHER,
          message:
            "Hello! I'd be happy to help you with this subject. I'm available for the times you mentioned.",
          isRead: true,
        },
        {
          senderId: adminId,
          senderRole: UserRole.ADMIN,
          message:
            "Your sessions have been scheduled. Please check your calendar for upcoming sessions.",
          isRead: true,
        },
        {
          senderId: teacherId,
          senderRole: UserRole.TEACHER,
          message:
            "We've completed all the planned sessions. You've made excellent progress!",
          isRead: true,
        },
        {
          senderId: studentId,
          senderRole: UserRole.STUDENT,
          message:
            "Thank you so much for your help! I feel much more confident now.",
          isRead: true,
        },
      ];

    case OrderStatus.REJECTED:
      return [
        ...baseMessages,
        {
          senderId: adminId,
          senderRole: UserRole.ADMIN,
          message:
            "Unfortunately, we couldn't find a suitable teacher for your requested time slots. Please consider alternative times or we can suggest other qualified teachers.",
          isRead: false,
        },
      ];

    case OrderStatus.CANCELLED:
      return [
        ...baseMessages,
        {
          senderId: teacherId,
          senderRole: UserRole.TEACHER,
          message:
            "Hello! I'd be happy to help you with this subject. I'm available for the times you mentioned.",
          isRead: true,
        },
        {
          senderId: studentId,
          senderRole: UserRole.STUDENT,
          message:
            "I'm sorry, but I need to cancel this order due to a schedule conflict. Thank you for your understanding.",
          isRead: true,
        },
        {
          senderId: teacherId,
          senderRole: UserRole.TEACHER,
          message:
            "No problem at all. Feel free to reach out again when your schedule allows.",
          isRead: true,
        },
      ];

    default:
      return baseMessages;
  }
}

// ============================================================================
// MAIN SEEDER FUNCTION
// ============================================================================
async function main() {
  console.log("🌱 Starting comprehensive database seeding...");
  console.log("");

  try {
    // Step 1: Seed users (admin, teachers, students)
    const userData = await seedUsers();
    console.log("");

    // Step 2: Seed dynamic options
    await seedDynamicOptions();
    console.log("");

    // Step 3: Seed teachers
    await seedTeachers(userData);
    console.log("");

    // Step 4: Seed tutoring packages
    await seedTutoringPackages();
    console.log("");

    // Step 5: Seed students with form responses
    await seedStudents(userData);
    console.log("");

    // Step 6: Seed orders
    await seedOrders(userData);
    console.log("");

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
main().catch((e) => {
  console.error(e);
  // process.exit(1);
});
