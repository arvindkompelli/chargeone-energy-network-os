import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const prismaPkg = require('@prisma/client');
const PrismaClient = prismaPkg.PrismaClient || prismaPkg.default?.PrismaClient || prismaPkg;

// Load unified root environment configuration
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/chargeone?schema=public';

export const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export default prisma;
