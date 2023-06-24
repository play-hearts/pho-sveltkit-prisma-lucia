import { asVariant } from '$lib/variant.js'
import { error, fail } from '@sveltejs/kit'
import { getPlayers, hasPlayer } from '$lib/players.js'
import { prisma } from '$lib/server/prisma.js'
import { TableState } from '@prisma/client'
import type { Actions, PageServerLoad } from './$types'
import type { GameTable } from '@prisma/client'
import type { Players } from '$lib/players.js'
import type { Variant } from '@prisma/client'

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session, user } = await locals.auth.validateUser()
	if (!session || !user) {
		throw error(401, 'Unauthorized')
	}

	const getGameTable = async (userId: string): Promise<GameTable> => {
		const table: GameTable | null = await prisma.gameTable.findUnique({
			where: {
				id: params.tableId
			}
		})
		if (!table) {
			throw error(404, 'No such game table')
		}
		// let players: Players = getPlayers(table);
		// if (!hasPlayer(players, userId)) {
		// 	throw error(403, 'Unauthorized')
		// }
		return table
	}

	return {
		gameTable: getGameTable(user.userId)
	}
}

export const actions: Actions = {
	startTable: async ({ request, params, locals }) => {
		const { session, user } = await locals.auth.validateUser()
		if (!session || !user) {
			throw error(401, 'Unauthorized')
		}

		const { variant, west, north, east } = Object.fromEntries(await request.formData()) as Record<
			string,
			string
		>

		const v: Variant = asVariant(variant)

		try {
			const gameTable = await prisma.gameTable.findUniqueOrThrow({
				where: {
					id: params.tableId
				}
			})

			let playersBefore: Players = getPlayers(gameTable);
			// console.log('Players before:', playersBefore);

			if (playersBefore.south !== gameTable.ownerId) {
				throw fail(403, { message: 'Forbidden change south seat to not be table owner.' })
			}

			let players = { south: gameTable.ownerId, west, north, east };
			// console.log('Players after:', players);

			await prisma.gameTable.update({
				where: {
					id: params.tableId
				},
				data: {
					variant: v,
					players,
					state: TableState.PLAYING
				}
			})
		} catch (err) {
			console.error(err)
			return fail(500, { message: 'Could not start the game table' })
		}

		return {
			status: 200
		}
	}
}
