import { RoundState, Variant, type GameTable, type Round } from "@prisma/client";
import NodeCache from "node-cache";
import { getPlays, getSpecificRound, type Plays } from "./gameRound";
import { instance } from "$lib/server/gstate.js";
import { prisma } from "./prisma";
import type { Card, GState, GStateInit } from "@playhearts/gstate_wasm";

// We can recreate the GState from the RoundState so its not a big deal if
// we expire a GState before the round is finished.
const gstateCache = new NodeCache({
    stdTTL: 60 * 60 * 24, // 1 day
    checkperiod: 60 * 60, // 1 hour
    deleteOnExpire: false,
    useClones: false,
});

gstateCache.on("expired", function (key, value) {
    console.log(`gstateCache expired ${key}`)
    if (value) {
        value.delete()
    }
});

function mapVariant(dbVariant: Variant) {
    switch (dbVariant) {
        case Variant.STANDARD:
            return instance.GameVariant.STANDARD
        case Variant.JACK:
            return instance.GameVariant.JACK
        case Variant.SPADES:
            return instance.GameVariant.SPADES
        default:
            throw new Error(`unknown variant ${dbVariant}`)
    }
}


function createCurrentGState(gameTable: GameTable, tableRound: Round): GState {
    const { dealHexStr }: GStateInit = tableRound
    const passOffset = 0;   // TODO Support passing/bidding

    const init: GStateInit = { dealHexStr, passOffset }
    const gstate: GState = new instance.GState(init, mapVariant(gameTable.variant))
    sanityCheckGState(gstate)
    gstate.startGame()
    sanityCheckGState(gstate)
    const plays: Plays = getPlays(tableRound)
    plays.forEach((play: number): void => {
        const card: Card = new instance.Card(play)
        gstate.playCard(card)
        card.delete()
        sanityCheckGState(gstate)
    })

    return gstate
}

function mustHaveFunction(obj: any, name: string): void {
    if (!(name in obj) || typeof obj[name] !== 'function') {
        throw new Error(`object must have function ${name}`)
    }
}

export function sanityCheckGState(gstate: GState): void {
    mustHaveFunction(gstate, 'currentPlayer')
    mustHaveFunction(gstate, 'currentTrick')
    mustHaveFunction(gstate, 'priorTrick')
    mustHaveFunction(gstate, 'done')
    mustHaveFunction(gstate, 'playersHand')
}

type GStateAndRound = { gstate: GState, tableRound: Round }

export async function getGStateRound(tableId: string, round: number): Promise<GStateAndRound> {
    const key = `${tableId}_${round}`;
    const tableId_round = { tableId, round }
    let tableRound = await getSpecificRound(tableId, round);
    let gstate = gstateCache.get<GState>(key);
    if (!gstate) {
        console.error(`gstateCache miss ${key}`)
        if (tableRound.state == RoundState.BIDDING) {
            tableRound = await prisma.round.update({ where: { tableId_round }, data: { state: RoundState.PLAYING } })
        }
        const gameTable: GameTable = await prisma.gameTable.findUniqueOrThrow({ where: { id: tableRound.tableId } });


        gstate = createCurrentGState(gameTable, tableRound);
        gstateCache.set<GState>(key, gstate);
    }
    if (!gstate) throw new Error('gstate is null')
    if (gstate.done() && tableRound.state == RoundState.PLAYING) {
        tableRound = await prisma.round.update({ where: { tableId_round }, data: { state: RoundState.DONE } })
    }
    sanityCheckGState(gstate)
    return { gstate, tableRound };
}
