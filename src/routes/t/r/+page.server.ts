import { cardTypeToOrd, type CardType } from '$lib/cards';
import { parse } from 'devalue'
import { instance } from '$lib/server/gstate'
import type { Card } from '@playhearts/gstate_wasm'
import { getSpecificRound, playCard } from '$lib/server/gameRound.js';
import type { Round } from '@prisma/client';
import type { RequestEvent } from './$types';

import { table_round_key, type TableRoundKey } from '$lib/table_round_key'
let tableRoundKey: TableRoundKey;
table_round_key.subscribe((value) => {
    tableRoundKey = value;
})

export const actions = {
    cardclicked: async (event: RequestEvent): Promise<void> => {
        const { tableId, round } = tableRoundKey
        const data = Object.fromEntries(await event.request.formData()) as Record<string, string>
        const cardType: CardType = parse(data['card'])
        const ord = cardTypeToOrd(cardType)
        const card: Card = new instance.Card(ord)
        await playCard(tableId, round, card)
    },
};
