CREATE TABLE `admin_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected','revoked') NOT NULL DEFAULT 'pending',
	`reviewedAt` timestamp,
	`reviewedByUserId` int,
	`reviewNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_requests_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_governance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`primaryAdminUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_governance_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplace_governance_primaryAdminUserId_unique` UNIQUE(`primaryAdminUserId`)
);
--> statement-breakpoint
CREATE TABLE `seller_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`badge` enum('trusted','pioneer') NOT NULL,
	`assignedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seller_badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `seller_badges_seller_badge_unique` UNIQUE(`sellerId`,`badge`)
);
--> statement-breakpoint
ALTER TABLE `marketplace_products` MODIFY COLUMN `currency` enum('NGN','USD','GBP','EUR') NOT NULL DEFAULT 'NGN';--> statement-breakpoint
ALTER TABLE `seller_profiles` MODIFY COLUMN `status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `seller_profiles` ADD `sellerCode` varchar(32);--> statement-breakpoint
ALTER TABLE `seller_profiles` ADD CONSTRAINT `seller_profiles_sellerCode_unique` UNIQUE(`sellerCode`);--> statement-breakpoint
ALTER TABLE `admin_requests` ADD CONSTRAINT `admin_requests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_requests` ADD CONSTRAINT `admin_requests_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplace_governance` ADD CONSTRAINT `marketplace_governance_primaryAdminUserId_users_id_fk` FOREIGN KEY (`primaryAdminUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seller_badges` ADD CONSTRAINT `seller_badges_sellerId_seller_profiles_id_fk` FOREIGN KEY (`sellerId`) REFERENCES `seller_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seller_badges` ADD CONSTRAINT `seller_badges_assignedByUserId_users_id_fk` FOREIGN KEY (`assignedByUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `admin_requests_status_idx` ON `admin_requests` (`status`);--> statement-breakpoint
CREATE INDEX `seller_badges_seller_idx` ON `seller_badges` (`sellerId`);