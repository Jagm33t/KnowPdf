import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Parse the DATABASE_URL from the .env file
const databaseUrl = new URL(process.env.DATABASE_URL!);

export default defineConfig({
  dialect: "postgresql", // PostgreSQL dialect
  schema: "./src/lib/db/schema.ts", // Path to your schema file
  out: "./drizzle/migrations", // Path where migration files will be generated
  dbCredentials: {
    host: databaseUrl.hostname, // Database host (from URL)
    port: Number(databaseUrl.port || 5432), // PostgreSQL default port is 5432
    user: databaseUrl.username, // Database username (from URL)
    password: databaseUrl.password || undefined, // Database password (from URL)
    database: databaseUrl.pathname.replace(/^\//, ""), // Database name (from URL)
    ssl: databaseUrl.searchParams.get("sslmode") === "require", // SSL mode (from URL)
  },
});
