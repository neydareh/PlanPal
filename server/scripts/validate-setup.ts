import { config } from "../src/config";
import { redisClient } from "../src/utils/cache";
import { db } from "../src/db";
import { sql } from "drizzle-orm";
import chalk from "chalk";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function validateSetup() {
  console.log("🔍 Validating system setup...\n");
  console.info("📝 Checking environment variables:");
  const requiredEnvVars = [
    "DATABASE_URL",
    "AUTH0_DOMAIN",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
    "REDIS_URL",
  ];

  let missingVars = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.error(
      chalk.red("❌ Missing environment variables:"),
      missingVars.join(", ")
    );
  } else {
    console.log(chalk.green("✅ All required environment variables are set"));
  }

  // Check database connection
  console.log(chalk.blue("\n📊 Checking database connection:"));
  try {
    await db.execute(sql`SELECT 1`);
    console.log(chalk.green("✅ Database connection successful"));
  } catch (error: any) {
    console.error(
      chalk.red("❌ Database connection failed:"),
      error?.message || "Unknown error"
    );
  }

  // Check Redis connection
  // console.log(chalk.blue("\n📍 Checking Redis connection:"));
  // try {
  //   await redisClient.ping();
  //   console.log(chalk.green("✅ Redis connection successful"));
  // } catch (error: any) {
  //   console.error(
  //     chalk.red("❌ Redis connection failed:"),
  //     error?.message || "Unknown error"
  //   );
  // }

  // Check API documentation
  console.log(chalk.blue("\n📚 Checking API documentation:"));
  try {
    const swaggerSpec = await import("../src/config/swagger");
    if (swaggerSpec) {
      console.log(chalk.green("✅ Swagger documentation is configured"));
    }
  } catch (error: any) {
    console.error(
      chalk.red("❌ Swagger documentation not configured:"),
      error?.message || "Unknown error"
    );
  }

  // Check rate limiting configuration
  console.log(chalk.blue("\n🔒 Checking rate limiting configuration:"));
  if (
    config.defaultRateLimit &&
    config.defaultRateLimit.window &&
    config.defaultRateLimit.max
  ) {
    console.log(chalk.green("✅ Rate limiting is configured"));
  } else {
    console.error(chalk.red("❌ Rate limiting configuration is missing"));
  }

  console.log(chalk.cyan("\n✨ Validation complete!"));

  // exit process
  process.exit(0);
}

// Run validation
validateSetup().catch(console.error);
