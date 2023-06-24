import { error, fail, redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server/prisma.js'
import type { Actions, PageServerLoad } from './$types'
import type { Prisma, Round } from '@prisma/client'
import type { } from '@prisma/client'

export const load: PageServerLoad = async ({ params, locals }) => {
    const { session, user } = await locals.auth.validateUser()
    if (!session || !user) {
        throw error(401, 'Unauthorized')
    }

    const { tableId, round: r } = params;
    const round = parseInt(r, 10);
    const tableId_round: Prisma.RoundTableIdRoundCompoundUniqueInput = { tableId, round };

    const getRound = async (userId: string): Promise<Round> => {
        const tableRound: Round | null = await prisma.round.findUnique({
            where: {
                tableId_round,
            }
        })
        if (!tableRound) {
            throw error(404, 'No such round')
        }

        console.log('Round:', tableRound);

        return tableRound
    }

    return {
        tableRound: getRound(user.userId)
    }
}
