import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// generate 不需要真实连接；migrate / push / studio 需要 .env 中的 DATABASE_URL
const url = process.env.DATABASE_URL ?? "mysql://localhost:3306/vibe_leading";

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "mysql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
