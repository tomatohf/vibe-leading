CREATE TABLE `crews` (
	`id` varchar(36) NOT NULL,
	`name` varchar(64) NOT NULL,
	`manager_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crews_id` PRIMARY KEY(`id`),
	CONSTRAINT `crews_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(36) NOT NULL,
	`crew_id` varchar(36) NOT NULL,
	`description` varchar(4096) NOT NULL,
	`expected_output` varchar(512) NOT NULL,
	`agent_id` varchar(36),
	`async_execution` boolean DEFAULT false,
	`contexts` json DEFAULT ('[]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
