CREATE TABLE `chats` (
	`id` varchar(36) NOT NULL,
	`tpe` enum('agent','crew') NOT NULL,
	`robot_id` varchar(36) NOT NULL,
	`messages` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
