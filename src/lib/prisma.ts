import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;

const omitConfig = {
  user: {
    password: true,
  },
} as const;

const adapter = new PrismaPg({ connectionString }, { schema: "backend" });
const prisma = new PrismaClient({ adapter, omit: omitConfig });

export { prisma };
