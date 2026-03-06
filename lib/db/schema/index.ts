import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

import { type BaseEvent, type RunAgentInput } from "@ag-ui/client";


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

export const crews = mysqlTable("crews", {
  id: varchar("id", { length: 36 }).primaryKey(),

  role: varchar("name", { length: 64 }).notNull().unique(),
  managerId: varchar("manager_id", { length: 36 }),
  // process=Process.hierarchical if managerId else Process.sequential
  // allow_delegation=True if (agent.id == managerId) else False

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Crew = typeof crews.$inferSelect;
export type NewCrew = typeof crews.$inferInsert;

export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),

  crewId: varchar("crew_id", { length: 36 }).notNull(),
  description: varchar("description", { length: 4096 }).notNull(),
  expectedOutput: varchar("expected_output", { length: 512 }).notNull(),

  agentId: varchar("agent_id", { length: 36 }),
  asyncExecution: boolean("async_execution").default(false),
  contexts: json("contexts").$type<string[]>().default([]),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

/**
 * 业务表：chats
 * - tpe：类型枚举
 * - robotId：关联的 robot（UUID）
 * - messages：消息列表（JSON 数组）
 */
export const chatTpeEnum = ["agent", "crew"] as const;
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
}

export const chats = mysqlTable("chats", {
  // thread_id
  id: varchar("id", { length: 36 }).primaryKey(),

  tpe: mysqlEnum("tpe", chatTpeEnum).notNull(),
  robotId: varchar("robot_id", { length: 36 }).notNull(),
  messages: json("messages").$type<ChatMessage[]>().notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;

/**
 * 业务表：chat_runs
 */
export const chatRuns = mysqlTable("chat_runs", {
  // run_id
  id: varchar("id", { length: 36 }).primaryKey(),

  // thread_id
  chatId: varchar("chat_id", { length: 36 }).notNull(),
  events: json("events").$type<BaseEvent[]>().notNull(),
  input: json("input").$type<RunAgentInput>().notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ChatRun = typeof chatRuns.$inferSelect;
export type NewChatRun = typeof chatRuns.$inferInsert;
