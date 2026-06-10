import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getPostgresConnectionString } from './postgres-url'

const pool = new Pool({ connectionString: getPostgresConnectionString() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
