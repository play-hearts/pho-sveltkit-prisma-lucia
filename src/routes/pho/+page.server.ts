import { asVariant } from '$lib/variant.js'
import { error, fail, redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server/prisma'
import type { Actions, PageServerLoad } from './$types'
import type { Variant } from '@prisma/client'

export const load: PageServerLoad = async () => {
	return {
		gameTables: await prisma.gameTable.findMany()
	}
}

export const actions: Actions = {
	createGameTable: async ({ request, locals }) => {
		const { session, user } = await locals.auth.validateUser()
		if (!session || !user) {
			throw redirect(302, '/')
		}

		const { variant, west, north, east } = Object.fromEntries(await request.formData()) as Record<
			string,
			string
		>

		const v: Variant = asVariant(variant)
		const players = { south: user.userId, west, north, east }

		try {
			await prisma.gameTable.create({
				data: {
					variant: v,
					players
				}
			})
		} catch (err) {
			console.error(err)
			return fail(500, { message: 'Could not create the article.' })
		}

		return {
			status: 201
		}
	}
}
