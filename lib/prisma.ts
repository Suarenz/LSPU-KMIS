import { PrismaClient } from '@prisma/client'

// Create Prisma client instance
const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Enable detailed logging
  })
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Use the global instance in development to prevent exceeding connection limits
const client = globalThis.prisma || createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client

export default client