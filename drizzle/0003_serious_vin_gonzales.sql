CREATE TABLE `site_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorUserId` int NOT NULL,
	`sectionType` enum('banner','community','collection','notice') NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`actionLabel` varchar(80),
	`actionUrl` varchar(500),
	`imageUrl` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `site_sections` ADD CONSTRAINT `site_sections_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `site_sections_status_idx` ON `site_sections` (`status`);--> statement-breakpoint
CREATE INDEX `site_sections_order_idx` ON `site_sections` (`displayOrder`);