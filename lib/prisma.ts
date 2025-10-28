import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Enable detailed logging
  })
}

const client = globalThis.prisma || createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client

export default client