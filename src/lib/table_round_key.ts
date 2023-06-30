import { writable } from "svelte/store";

export type TableRoundKey = {
    tableId: string;
    round: number
};

export const table_round_key = writable<TableRoundKey>({ tableId: '', round: 0 });

export function setTableRoundKey(tableId: string, round: number | string): void {
    if (typeof round == 'string') {
        round = parseInt(round);
        if (Number.isNaN(round)) throw new Error('round is NaN');
        if (round < 0 || round > 30) throw new Error('round is out of range');
    }
    table_round_key.set({ tableId, round });
}
