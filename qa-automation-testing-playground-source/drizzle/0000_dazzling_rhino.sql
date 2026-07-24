CREATE TABLE `test_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`total_cents` integer NOT NULL,
	`created_at` integer NOT NULL
);
