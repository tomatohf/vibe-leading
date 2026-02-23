CREATE TABLE `agents` (
	`id` varchar(36) NOT NULL,
	`role` varchar(64) NOT NULL,
	`goal` varchar(512) NOT NULL,
	`backstory` varchar(4096) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_role_unique` UNIQUE(`role`)
);
