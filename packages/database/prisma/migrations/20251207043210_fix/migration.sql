/*
  Warnings:

  - A unique constraint covering the columns `[ideaId]` on the table `Phase` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Law` ADD COLUMN `eli` VARCHAR(255) NULL,
    ADD COLUMN `passed` BOOLEAN NULL,
    ADD COLUMN `processNumber` VARCHAR(50) NULL,
    ADD COLUMN `term` INTEGER NULL;

-- AlterTable
ALTER TABLE `Phase` ADD COLUMN `ideaId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ImpactAnalysis` (
    `id` VARCHAR(191) NOT NULL,
    `stageId` VARCHAR(191) NOT NULL,
    `economicScore` INTEGER NOT NULL DEFAULT 1,
    `socialScore` INTEGER NOT NULL DEFAULT 1,
    `administrativeScore` INTEGER NOT NULL DEFAULT 1,
    `technologicalScore` INTEGER NOT NULL DEFAULT 1,
    `environmentalScore` INTEGER NOT NULL DEFAULT 1,
    `overallScore` INTEGER NOT NULL DEFAULT 1,
    `mainAffectedGroup` VARCHAR(500) NULL,
    `uncertaintyLevel` VARCHAR(100) NULL,
    `simpleSummary` JSON NOT NULL,
    `economicDetails` JSON NULL,
    `socialDetails` JSON NULL,
    `administrativeDetails` JSON NULL,
    `technologicalDetails` JSON NULL,
    `environmentalDetails` JSON NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `editedByAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ImpactAnalysis_stageId_key`(`stageId`),
    INDEX `ImpactAnalysis_stageId_idx`(`stageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Law_term_processNumber_idx` ON `Law`(`term`, `processNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `Phase_ideaId_key` ON `Phase`(`ideaId`);

-- AddForeignKey
ALTER TABLE `Phase` ADD CONSTRAINT `Phase_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `Idea`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImpactAnalysis` ADD CONSTRAINT `ImpactAnalysis_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
