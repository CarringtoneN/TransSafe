ALTER TABLE `vehicle` ADD COLUMN `carryingCapacity` INT NULL, ADD COLUMN `currentMileage` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `user` ADD COLUMN `workshop` VARCHAR(191) NULL;
ALTER TABLE `trip` ADD COLUMN `startOdometer` DOUBLE NULL, ADD COLUMN `endOdometer` DOUBLE NULL, ADD COLUMN `actualDistance` DOUBLE NULL;
ALTER TABLE `trip` MODIFY COLUMN `status` ENUM('SCHEDULED','IN_PROGRESS','PAUSED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED';
CREATE TABLE `approval_record` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `entityType` VARCHAR(50) NOT NULL,
 `entityId` INT NOT NULL,
 `action` VARCHAR(50) NOT NULL,
 `approvedByUserId` INT NULL,
 `approvedByName` VARCHAR(150) NULL,
 `approvedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 `notes` VARCHAR(2000) NULL,
 PRIMARY KEY (`id`),
 INDEX `approval_record_entity_idx` (`entityType`,`entityId`),
 INDEX `approval_record_date_idx` (`approvedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
