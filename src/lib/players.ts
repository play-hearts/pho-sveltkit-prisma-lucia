import type { GameTable } from "@prisma/client";
import { error } from '@sveltejs/kit'

export type Seats = 'south' | 'west' | 'north' | 'east';
export type Players = {
    [seat in Seats]: string;
}

export function getPlayers(table: GameTable): Players {
    const p = table.players?.valueOf();
    if (!p) throw error(500, 'game table has no players')
    if (typeof p != 'object') throw error(500, 'game table players is not an object')
    if (Array.isArray(p)) throw error(500, "game table players should not be an array")
    return p as Players
}

export function hasPlayer(players: Players, userId: string): boolean {
    return Object.values(players).indexOf(userId) !== -1;
}
