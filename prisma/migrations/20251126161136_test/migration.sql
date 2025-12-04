-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `age` INTEGER NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `isFormCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `students_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_form_responses` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `studentType` ENUM('PARENT', 'STUDENT') NULL,
    `inclusiveLearning` ENUM('ADHD', 'DYSLEXIA', 'DYSCALCULIA', 'DYSGRAPHIA', 'NONE') NULL,
    `formGender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `curriculum` ENUM('IB_SYSTEM', 'AMERICAN_SYSTEM', 'BRITISH_SYSTEM', 'FRENCH_SYSTEM', 'NATIONAL_SYSTEM', 'OTHER') NULL,
    `grade` ENUM('GRADE1', 'GRADE2', 'GRADE3', 'GRADE4', 'GRADE5', 'GRADE6', 'GRADE7', 'GRADE8', 'GRADE9', 'GRADE10', 'GRADE11', 'GRADE12') NULL,
    `selectedCategories` VARCHAR(191) NULL,
    `selectedSubcategories` VARCHAR(191) NULL,
    `preferredTime` ENUM('WEEKEND', 'WEEKDAYS') NULL,
    `preferredTutor` ENUM('MALE_TUTOR', 'FEMALE_TUTOR', 'BOTH') NULL,
    `sessionType` ENUM('ONLINE_SESSIONS', 'OFFLINE_SESSIONS') NULL,
    `currentStep` INTEGER NOT NULL DEFAULT 1,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_form_responses_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `age` INTEGER NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `profilePhoto` VARCHAR(191) NULL,
    `universityAffiliation` VARCHAR(191) NULL,
    `highestEducation` ENUM('BACHELOR', 'MASTER', 'MBA', 'PHD', 'OTHER') NULL,
    `yearsExperience` INTEGER NULL,
    `languagesSpoken` VARCHAR(191) NULL,
    `shortBio` TEXT NULL,
    `shortVideo` VARCHAR(191) NULL,
    `preferredTutoringTime` ENUM('WEEKDAYS', 'WEEKENDS', 'FLEXIBLE') NULL,
    `preferredTutoringMethod` ENUM('ONLINE', 'PHYSICAL') NULL,
    `location` ENUM('UAE', 'LEBANON', 'OTHER') NULL,
    `proposedHourlyRate` DOUBLE NULL,
    `cvFile` VARCHAR(191) NULL,
    `certificates` VARCHAR(191) NULL,
    `agreedToTerms` BOOLEAN NOT NULL DEFAULT false,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teachers_userId_key`(`userId`),
    UNIQUE INDEX `teachers_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_applications` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewNotes` TEXT NULL,
    `applicationData` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teacher_applications_teacherId_key`(`teacherId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_role_selections` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `role` ENUM('TUTORING', 'TEACHING', 'COURSING', 'COACHING') NOT NULL,

    UNIQUE INDEX `teacher_role_selections_teacherId_role_key`(`teacherId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dynamic_options` (
    `id` VARCHAR(191) NOT NULL,
    `parentRole` ENUM('TUTORING', 'TEACHING', 'COURSING', 'COACHING') NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_sub_option_selections` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `teacher_sub_option_selections_teacherId_optionId_key`(`teacherId`, `optionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_deep_option_selections` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `teacher_deep_option_selections_teacherId_optionId_key`(`teacherId`, `optionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `grade` ENUM('GRADE1', 'GRADE2', 'GRADE3', 'GRADE4', 'GRADE5', 'GRADE6', 'GRADE7', 'GRADE8', 'GRADE9', 'GRADE10', 'GRADE11', 'GRADE12') NOT NULL,
    `curriculum` ENUM('IB_SYSTEM', 'AMERICAN_SYSTEM', 'BRITISH_SYSTEM', 'FRENCH_SYSTEM', 'NATIONAL_SYSTEM', 'OTHER') NOT NULL,
    `sessionType` ENUM('ONLINE_SESSIONS', 'OFFLINE_SESSIONS') NOT NULL,
    `preferredTime` ENUM('WEEKEND', 'WEEKDAYS') NOT NULL,
    `sessionsPerWeek` INTEGER NOT NULL DEFAULT 1,
    `sessionDuration` INTEGER NOT NULL DEFAULT 60,
    `totalSessions` INTEGER NULL,
    `location` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `proposedRate` DOUBLE NULL,
    `agreedRate` DOUBLE NULL,
    `totalAmount` DOUBLE NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `preferredStartDate` DATETIME(3) NULL,
    `actualStartDate` DATETIME(3) NULL,
    `estimatedEndDate` DATETIME(3) NULL,
    `actualEndDate` DATETIME(3) NULL,
    `requirements` TEXT NULL,
    `specialNeeds` TEXT NULL,
    `studentNotes` TEXT NULL,
    `teacherNotes` TEXT NULL,
    `adminNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_history` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `previousStatus` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED') NULL,
    `newStatus` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL,
    `changedBy` VARCHAR(191) NOT NULL,
    `changeReason` TEXT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_messages` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `senderRole` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `attachments` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tutoring_packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `level` ENUM('SCHOOL', 'UNIVERSITY') NOT NULL,
    `mode` ENUM('ONLINE', 'OFFLINE') NOT NULL,
    `paidHours` INTEGER NOT NULL,
    `freeSessions` INTEGER NOT NULL,
    `totalHours` INTEGER NOT NULL,
    `priceAED` DOUBLE NOT NULL,
    `effectiveRateAED` DOUBLE NOT NULL,
    `shortNote` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `grade` ENUM('GRADE1', 'GRADE2', 'GRADE3', 'GRADE4', 'GRADE5', 'GRADE6', 'GRADE7', 'GRADE8', 'GRADE9', 'GRADE10', 'GRADE11', 'GRADE12') NULL,
    `curriculum` ENUM('IB_SYSTEM', 'AMERICAN_SYSTEM', 'BRITISH_SYSTEM', 'FRENCH_SYSTEM', 'NATIONAL_SYSTEM', 'OTHER') NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `duration` INTEGER NULL,
    `maxStudents` INTEGER NULL,
    `thumbnail` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_form_responses` ADD CONSTRAINT `student_form_responses_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `teacher_applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_role_selections` ADD CONSTRAINT `teacher_role_selections_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dynamic_options` ADD CONSTRAINT `dynamic_options_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `dynamic_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_sub_option_selections` ADD CONSTRAINT `teacher_sub_option_selections_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_sub_option_selections` ADD CONSTRAINT `teacher_sub_option_selections_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `dynamic_options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_deep_option_selections` ADD CONSTRAINT `teacher_deep_option_selections_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_deep_option_selections` ADD CONSTRAINT `teacher_deep_option_selections_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `dynamic_options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_history` ADD CONSTRAINT `order_history_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_messages` ADD CONSTRAINT `order_messages_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
