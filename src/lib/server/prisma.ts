import { PrismaClient } from '@prisma/client'
import { env } from '$env/dynamic/private'

export const prisma = global.__prisma || new PrismaClient()

if (env.NODE_ENV === 'development') {
	global.__prisma = prisma
}
