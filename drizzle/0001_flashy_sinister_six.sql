CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`pinned` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buyer_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`buyerUserId` int NOT NULL,
	`sellerId` int NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','replied','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buyer_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`category` enum('figures','clothing','manga','accessories','posters','digital','home','cosplay') NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'NGN',
	`status` enum('draft','submitted','published','rejected') NOT NULL DEFAULT 'draft',
	`reviewNote` text,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`imageUrl` text NOT NULL,
	`altText` varchar(240),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seller_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shopName` varchar(140) NOT NULL,
	`shopSlug` varchar(160) NOT NULL,
	`bio` text,
	`contactEmail` varchar(320),
	`logoUrl` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewNote` text,
	`reviewedAt` timestamp,
	`reviewedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seller_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `seller_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `seller_profiles_shopSlug_unique` UNIQUE(`shopSlug`)
);
--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `buyer_contacts` ADD CONSTRAINT `buyer_contacts_productId_marketplace_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `marketplace_products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `buyer_contacts` ADD CONSTRAINT `buyer_contacts_buyerUserId_users_id_fk` FOREIGN KEY (`buyerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `buyer_contacts` ADD CONSTRAINT `buyer_contacts_sellerId_seller_profiles_id_fk` FOREIGN KEY (`sellerId`) REFERENCES `seller_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplace_products` ADD CONSTRAINT `marketplace_products_sellerId_seller_profiles_id_fk` FOREIGN KEY (`sellerId`) REFERENCES `seller_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_marketplace_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `marketplace_products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seller_profiles` ADD CONSTRAINT `seller_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seller_profiles` ADD CONSTRAINT `seller_profiles_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `announcements_status_idx` ON `announcements` (`status`);--> statement-breakpoint
CREATE INDEX `announcements_pinned_idx` ON `announcements` (`pinned`);--> statement-breakpoint
CREATE INDEX `buyer_contacts_seller_idx` ON `buyer_contacts` (`sellerId`);--> statement-breakpoint
CREATE INDEX `buyer_contacts_buyer_idx` ON `buyer_contacts` (`buyerUserId`);--> statement-breakpoint
CREATE INDEX `marketplace_products_seller_idx` ON `marketplace_products` (`sellerId`);--> statement-breakpoint
CREATE INDEX `marketplace_products_status_idx` ON `marketplace_products` (`status`);--> statement-breakpoint
CREATE INDEX `marketplace_products_category_idx` ON `marketplace_products` (`category`);--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `product_images` (`productId`);--> statement-breakpoint
CREATE INDEX `seller_profiles_status_idx` ON `seller_profiles` (`status`);