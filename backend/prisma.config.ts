import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env or local fallback
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default {
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/chargeone?schema=public',
  },
};
