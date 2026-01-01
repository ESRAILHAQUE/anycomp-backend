import { DataSource } from "typeorm";
import { config } from "dotenv";
import path from "path";

config();

// Support both connection string and individual parameters
const getDataSourceConfig = () => {
  // If DATABASE_URL is provided, use it directly
  if (process.env.DATABASE_URL) {
    return {
      type: "postgres" as const,
      url: process.env.DATABASE_URL,
      synchronize: process.env.NODE_ENV === "development",
      logging: process.env.NODE_ENV === "development",
      ssl: process.env.DATABASE_URL.includes("sslmode=require")
        ? {
            rejectUnauthorized: false,
          }
        : false,
      entities: [path.join(__dirname, "../entities/**/*.entity{.ts,.js}")],
      migrations: [path.join(__dirname, "../migrations/**/*{.ts,.js}")],
      subscribers: [path.join(__dirname, "../subscribers/**/*{.ts,.js}")],
    };
  }

  // Otherwise, use individual parameters
  return {
    type: "postgres" as const,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "stcomp_holdings",
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
    entities: [path.join(__dirname, "../entities/**/*.entity{.ts,.js}")],
    migrations: [path.join(__dirname, "../migrations/**/*{.ts,.js}")],
    subscribers: [path.join(__dirname, "../subscribers/**/*{.ts,.js}")],
  };
};

export const AppDataSource = new DataSource(getDataSourceConfig());
