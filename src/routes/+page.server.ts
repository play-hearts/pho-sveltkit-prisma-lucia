import { asVariant } from '$lib/variant.js'
import { fail, redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server/prisma'
import { TableState, type GameTable } from '@prisma/client'
import type { Actions, PageServerLoad } from './$types'
import type { Variant } from '@prisma/client'
import { setTableRoundKey } from '$lib/table_round_key'

export const load: PageServerLoad = async () => {
	return {
		gameTables: await prisma.gameTable.findMany({ where: { state: TableState.OPEN } })
	}
}

export const actions: Actions = {
	createGameTable: async ({ request, locals }) => {
		const { session, user } = await locals.auth.validateUser()
		if (!session || !user) {
			throw redirect(302, '/')
		}

		const { variant: v, west, north, east } = Object.fromEntries(await request.formData()) as Record<string, string>

		const variant: Variant = asVariant(v)
		const ownerId = user.userId
		const players = { south: ownerId, west, north, east }

		let gameTable: GameTable
		try {
			gameTable = await prisma.gameTable.create({
				data: {
					ownerId,
					variant,
					players,
					state: TableState.OPEN
				}
			})
		} catch (err) {
			console.error(err)
			return fail(500, { message: 'Could not create the game table.' })
		}
		setTableRoundKey(gameTable.id, 0)
		throw redirect(302, `/t`)
	}
}
