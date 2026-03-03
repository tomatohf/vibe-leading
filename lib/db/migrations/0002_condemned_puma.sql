CREATE TABLE `chat_runs` (
	`id` varchar(36) NOT NULL,
	`chat_id` varchar(36) NOT NULL,
	`events` json NOT NULL,
	`input` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_runs_id` PRIMARY KEY(`id`)
);
