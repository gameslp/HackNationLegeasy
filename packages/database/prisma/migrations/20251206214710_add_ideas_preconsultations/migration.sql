-- CreateTable
CREATE TABLE `Idea` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `shortDescription` TEXT NOT NULL,
    `ministry` VARCHAR(255) NOT NULL,
    `area` ENUM('DIGITALIZATION', 'HEALTH', 'EDUCATION', 'TRANSPORT', 'ENVIRONMENT', 'TAXES', 'SECURITY', 'SOCIAL', 'ECONOMY', 'OTHER') NOT NULL,
    `status` ENUM('NEW', 'COLLECTING', 'SUMMARIZING', 'CLOSED', 'ARCHIVED', 'CONVERTED') NOT NULL DEFAULT 'NEW',
    `stage` ENUM('IDEA', 'CONCEPT', 'ASSUMPTIONS') NOT NULL DEFAULT 'IDEA',
    `problemDescription` TEXT NOT NULL,
    `proposedSolutions` JSON NOT NULL,
    `publishDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `opinionDeadline` DATETIME(3) NULL,
    `closedDate` DATETIME(3) NULL,
    `closureReason` TEXT NULL,
    `lawId` VARCHAR(191) NULL,
    `aiSummary` TEXT NULL,
    `aiSummaryDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Idea_lawId_key`(`lawId`),
    INDEX `Idea_area_idx`(`area`),
    INDEX `Idea_status_idx`(`status`),
    INDEX `Idea_publishDate_idx`(`publishDate`),
    INDEX `Idea_opinionDeadline_idx`(`opinionDeadline`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IdeaQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `ideaId` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `order` INTEGER NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IdeaQuestion_ideaId_idx`(`ideaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IdeaQuestionAnswer` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `opinionId` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IdeaQuestionAnswer_questionId_idx`(`questionId`),
    INDEX `IdeaQuestionAnswer_opinionId_idx`(`opinionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IdeaOpinion` (
    `id` VARCHAR(191) NOT NULL,
    `ideaId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `respondentType` ENUM('CITIZEN', 'NGO', 'COMPANY', 'EXPERT') NOT NULL DEFAULT 'CITIZEN',
    `organization` VARCHAR(255) NULL,
    `attachmentPath` VARCHAR(1000) NULL,
    `attachmentName` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IdeaOpinion_ideaId_idx`(`ideaId`),
    INDEX `IdeaOpinion_respondentType_idx`(`respondentType`),
    INDEX `IdeaOpinion_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IdeaSurveyResponse` (
    `id` VARCHAR(191) NOT NULL,
    `ideaId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `support` INTEGER NOT NULL,
    `importance` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IdeaSurveyResponse_ideaId_idx`(`ideaId`),
    INDEX `IdeaSurveyResponse_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IdeaTimelineEvent` (
    `id` VARCHAR(191) NOT NULL,
    `ideaId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NOT NULL,
    `order` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IdeaTimelineEvent_ideaId_idx`(`ideaId`),
    INDEX `IdeaTimelineEvent_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IdeaAttachment` (
    `id` VARCHAR(191) NOT NULL,
    `ideaId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(500) NOT NULL,
    `filePath` VARCHAR(1000) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IdeaAttachment_ideaId_idx`(`ideaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Idea` ADD CONSTRAINT `Idea_lawId_fkey` FOREIGN KEY (`lawId`) REFERENCES `Law`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeaQuestion` ADD CONSTRAINT `IdeaQuestion_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `Idea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeaQuestionAnswer` ADD CONSTRAINT `IdeaQuestionAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `IdeaQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeaQuestionAnswer` ADD CONSTRAINT `IdeaQuestionAnswer_opinionId_fkey` FOREIGN KEY (`opinionId`) REFERENCES `IdeaOpinion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeaOpinion` ADD CONSTRAINT `IdeaOpinion_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `Idea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeaSurveyResponse` ADD CONSTRAINT `IdeaSurveyResponse_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `Idea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeaTimelineEvent` ADD CONSTRAINT `IdeaTimelineEvent_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `Idea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdeaAttachment` ADD CONSTRAINT `IdeaAttachment_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `Idea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
