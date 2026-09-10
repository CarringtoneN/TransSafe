CREATE TABLE `incident_evidence` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `incidentId` INTEGER NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `mimeType` VARCHAR(100) NOT NULL,
  `fileSize` INTEGER NOT NULL,
  `fileData` MEDIUMBLOB NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `incident_evidence_incidentId_idx`(`incidentId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `incident_evidence_incidentId_fkey` FOREIGN KEY (`incidentId`) REFERENCES `incident`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
