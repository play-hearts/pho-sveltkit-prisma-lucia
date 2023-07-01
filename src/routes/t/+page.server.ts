import { asVariant } from '$lib/variant.js'
import { ActionFailure, error, fail, redirect, type ServerLoadEvent } from '@sveltejs/kit'
import { getPlayers } from '$lib/players.js'
import { prisma } from '$lib/server/prisma.js'
import { TableState } from '@prisma/client'
import type { Actions, PageServerLoad, RequestEvent } from './$types'
import type { GameTable } from '@prisma/client'
import type { Players } from '$lib/players.js'
import type { Variant } from '@prisma/client'

import { setTableRoundKey, table_round_key, type TableRoundKey } from '$lib/table_round_key'
import { findOrCreateActiveRound } from '$lib/server/gameRound'
let tableRoundKey: TableRoundKey;
table_round_key.subscribe((value: TableRoundKey): void => {
	tableRoundKey = value;
})

export const load: PageServerLoad = async (event: ServerLoadEvent): Promise<{ gameTable: GameTable }> => {
	const { url, locals } = event;
	const { session, user } = await locals.auth.validateUser()
	if (!session || !user) {
		throw error(401, 'Unauthorized')
	}

	let tableId = url.searchParams.get('t') || tableRoundKey.tableId;
	let round = url.searchParams.get('r') || tableRoundKey.round;
	setTableRoundKey(tableId, round);

	console.log('Loading: ', url.href)

	const getGameTable = async (): Promise<GameTable> => {
		const table: GameTable | null = await prisma.gameTable.findUnique({
			where: {
				id: tableId
			}
		})
		if (!table) {
			throw error(404, 'No such game table')
		}
		return table
	}

	return {
		gameTable: await getGameTable()
	}
}

export const actions: Actions = {
	startTable: async ({ request, locals }: RequestEvent) => {
		const { session, user } = await locals.auth.validateUser()
		if (!session || !user) {
			throw error(401, 'Unauthorized')
		}

		const tableId = tableRoundKey.tableId;
		console.log('Starting table:', tableId)

		const { variant: v, west, north, east } = Object.fromEntries(await request.formData()) as Record<string, string>

		const variant: Variant = asVariant(v)

		try {
			const gameTable = await prisma.gameTable.findUniqueOrThrow({
				where: {
					id: tableId
				}
			})

			let playersBefore: Players = getPlayers(gameTable)
			// console.log('Players before:', playersBefore);

			if (playersBefore.south !== gameTable.ownerId) {
				throw fail(403, { message: 'Forbidden change south seat to not be table owner.' })
			}

			let players = { south: gameTable.ownerId, west, north, east }
			// console.log('Players after:', players);

			const startedTable = await prisma.gameTable.update({
				where: {
					id: tableId
				},
				data: {
					variant,
					players,
					state: TableState.PLAYING
				}
			})

			// This check is not necessary, but it silences the `startedTable unused` warning
			if (startedTable.state !== TableState.PLAYING) {
				throw fail(500, { message: 'Could not start the game table' })
			}

			const round = await findOrCreateActiveRound(tableId);
			console.log('Started round:', round)
		} catch (err) {
			console.error(err)
			return fail(500, { message: 'Could not start the game table' })
		}

		const url = `/t/r`
		console.log('Redirecting to round at url:', url)

		throw redirect(302, url)
	}
}
