import factory from '@playhearts/gstate_wasm'
export const instance = await factory()

import { ordToCard, ordToTrickCard } from '$lib/cards.js'
import type { CardType, TrickCard, CardHand, TrickType } from '$lib/cards'
import type { CardSet, GState, CardVector, Trick, TrickOrdRep } from '@playhearts/gstate_wasm'

export function xCardSetToCardHand(cs: CardSet): CardHand {
    const hand: CardHand = []
    const vec: CardVector = cs.asCardVector()
    for (let i = 0; i < cs.size(); i++) {
        const ord: number = vec.get(i).ord()
        const card: CardType = ordToCard(ord)
        hand.push(card)
    }
    vec.delete()
    cs.delete()
    return hand
}

// export function currentPlayersHand(gstate: GState): CardHand {
//     return xCardSetToCardHand(gstate.currentPlayersHand())
// }

export function southsHand(gstate: GState): CardHand {
    return xCardSetToCardHand(gstate.playersHand(0))
}

export function southsLegal(gstate: GState): CardHand {
    return gstate.currentPlayer() === 0 ? xCardSetToCardHand(gstate.legalPlays()) : []
}

export function getTrick(gstate: GState, prior: boolean = true): TrickType {
    const p: number = gstate.playIndex();
    let t: Trick;
    if (!prior || p % 4 != 0)
        t = gstate.currentTrick();
    else {
        t = gstate.priorTrick();
    }
    const ords: TrickOrdRep = t.ordRep();
    t.delete();

    const trick: TrickType = ords.map((ord: number): TrickCard => { return ordToTrickCard(ord) }) as TrickType
    return trick
}
