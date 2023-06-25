import { error, fail, redirect } from '@sveltejs/kit'
import { instance } from '$lib/gstate.js'
import { prisma } from '$lib/server/prisma.js'
import type { Actions, PageServerLoad } from './$types'
import type { Prisma, Round } from '@prisma/client'
import type { GState, GStateInit, CardSet } from '@playhearts/gstate_wasm'

interface LoadResult {
    tableRound: Round
    handStr: string
}

export const load: PageServerLoad = async ({ params, locals }) => {
    const { session, user } = await locals.auth.validateUser()
    if (!session || !user) {
        throw error(401, 'Unauthorized')
    }

    const { tableId, round: r } = params
    const round = parseInt(r, 10)
    const tableId_round: Prisma.RoundTableIdRoundCompoundUniqueInput = { tableId, round }

    const getRound = async (userId: string): Promise<LoadResult> => {
        const tableRound: Round | null = await prisma.round.findUnique({
            where: {
                tableId_round
            }
        })
        if (!tableRound) {
            throw error(404, 'No such round')
        }

        const { dealHexStr, passOffset }: GStateInit = tableRound
        const init: GStateInit = { dealHexStr, passOffset }
        const gstate: GState = new instance.GState(init, instance.GameVariant.STANDARD)
        const hand: CardSet = gstate.currentPlayersHand()
        const handStr: string = instance.to_string(hand)
        console.log(`handStr: ${handStr}`)

        hand.delete()
        gstate.delete()

        return { tableRound, handStr }
    }

    return getRound(user.userId)
}
