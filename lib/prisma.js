import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { DATABASE_URL } from "../config/config.js"
import { PrismaClient } from "../generated/prisma/client.js"

const connectionString = DATABASE_URL

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
