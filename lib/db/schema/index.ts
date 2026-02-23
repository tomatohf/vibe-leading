import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

/**
 * 业务表：agents
 * - role：角色（短文本，唯一）
 * - goal：目标（中等长度文本）
 * - backstory：背景（长文本）
 */
export const agents = mysqlTable("agents", {
  id: varchar("id", { length: 36 }).primaryKey(),

  // 角色：较短字符串，唯一
  role: varchar("role", { length: 64 }).notNull().unique(),

  // 目标：中等长度字符串
  goal: varchar("goal", { length: 512 }).notNull(),

  // 背景：较长文本，最大 4096 字符
  backstory: varchar("backstory", { length: 4096 }).notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
