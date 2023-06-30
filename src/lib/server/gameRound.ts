
import { redirect } from "@sveltejs/kit";
import { getTrick, instance, southsHand, southsLegal } from "$lib/server/gstate.js";
import { Observable } from "rxjs";
import { prisma } from "$lib/server/prisma.js";
import debug from 'debug'
import { kEmptyTrick, type CardHand, type TrickType, type VisibleState } from '$lib/cards'
import type { Card, CardSet, GState, GStateInit } from "@playhearts/gstate_wasm";
import type { Observer } from 'rxjs'
import { RoundState, TableState, type GameTable, type Prisma, type Round } from '@prisma/client'
import { getGStateRound, sanityCheckGState } from "./gstate-cache";
import { scheduler } from 'node:timers/promises';

import { setTableRoundKey } from '$lib/table_round_key'

const dlog = debug('gameRound')

export type Plays = number[]

export function getPlays(round: Round): Plays {
    const p = round.plays?.valueOf()
    if (!p) throw new Error('game round has no plays')
    if (typeof p != 'object') throw new Error('game round plays is not an array')
    if (!Array.isArray(p)) throw new Error('game round plays should be an array')
    if (p.length != 0 && typeof p[0] != 'number') throw new Error('game round plays should be an array of numbers')
    return p as Plays
}

export async function findOrCreateActiveRound(tableId: string): Promise<Round> {
    let gameTable: GameTable | null = null;
    if (!tableId) {
        console.error('tableId is null')
        gameTable = await prisma.gameTable.findFirstOrThrow({ where: { state: TableState.PLAYING } });
        tableId = gameTable.id;
    }
    else {
        gameTable = await prisma.gameTable.findUnique({ where: { id: tableId } });
    }

    if (gameTable == null) {
        const msg = `gameTable not found ${tableId}`;
        console.error(msg);
        throw new Error(msg);
    }

    if (gameTable.state == TableState.DONE) throw new Error('table is done')

    const state = RoundState.PLAYING;

    let round = await prisma.round.findFirst({ where: { tableId, state } });
    if (!round) {
        const init: GStateInit = instance.kRandomVal()
        round = await prisma.round.create({
            data: {
                tableId,
                dealHexStr: init.dealHexStr,
                passOffset: 0,
                state,
            }
        })
    }
    if (!round) throw new Error('could not find or create active round');
    setTableRoundKey(round.tableId, round.round);
    return round;
}

// export async function createRound() {
//     const init: GStateInit = instance.kRandomVal()

//     const round: Round = await prisma.round.create({
//         data: {
//             tableId: tableRound.tableId,
//             round: tableRound.round + 1,
//             dealHexStr: init.dealHexStr
//         }
//     })

//     setTableRoundKey(tableRound.tableId, round.round)
//     console.log('Created Round:', round);
//     return round;
// }

export async function getSpecificRound(tableId: string, round: number): Promise<Round> {
    const tableId_round: Prisma.RoundTableIdRoundCompoundUniqueInput = { tableId, round }
    return await prisma.round.findUniqueOrThrow({ where: { tableId_round } });
}

export async function playCard(tableId: string, r: number, card: Card): Promise<Round> {
    const { gstate, tableRound } = await getGStateRound(tableId, r)
    gstate.playCard(card);
    const plays: Plays = getPlays(tableRound)
    plays.push(card.ord())
    card.delete()
    return prisma.round.update({
        where: {
            tableId_round: {
                tableId: tableRound.tableId,
                round: tableRound.round
            }
        },
        data: {
            plays
        }
    })
}

// createObserver returns an Observable that emits a VisibleState whenever the
// round is updated.
// Called from src/routes/table/[tableId]/[round]/subscribe/+server.ts
// when the client creates the EventSource.

export function createObserver(tableId: string, round: number): Observable<VisibleState> {
    let lastUpdated: number = 0
    const recordObserver: Observable<VisibleState> = new Observable<VisibleState>(
        function subscribe(observer: Observer<VisibleState>): () => void {
            const intervalId = setInterval(async (): Promise<void> => {
                const tableRound = await findOrCreateActiveRound(tableId);
                const updatedAt = tableRound.updatedAt.valueOf()
                if (updatedAt > lastUpdated) {
                    const { gstate, tableRound: tr } = await getGStateRound(tableId, tableRound.round);
                    if (tr.round != tableRound.round) throw new Error('round mismatch');
                    let trick: TrickType = getTrick(gstate)
                    const hand: CardHand = southsHand(gstate)
                    const legal: CardHand = southsLegal(gstate);
                    const state = gstate.done() ? 'DONE' : 'PLAYING'
                    const visibleState: VisibleState = { state, hand, trick, legal }
                    dlog('visibleState', visibleState)
                    observer.next(visibleState)

                    if (gstate.playIndex() % 4 == 0 && gstate.playIndex() < 52) {
                        await scheduler.wait(250);
                        trick = kEmptyTrick as TrickType
                        observer.next({ state, hand, trick, legal })
                    }

                    lastUpdated = updatedAt

                    if (gstate.done()) {
                        const result = gstate.getPlayerOutcome(0)
                        const scores = gstate.getPlayerScores()
                        console.log('round done. result:', result, 'scores:', scores)
                    } else if (gstate.currentPlayer() != 0) {
                        const legal: CardSet = gstate.legalPlays()
                        const play: Card = instance.aCardAtRandom(legal)
                        playCard(tableId, tableRound.round, play)
                        legal.delete()
                    }
                }
            }, 500)
            return (): void => {
                clearInterval(intervalId);
            };
        }
    )
    return recordObserver
}
