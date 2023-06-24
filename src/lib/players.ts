import type { GameTable } from "@prisma/client";
import { error } from '@sveltejs/kit'

export const ALL_SEATS = ['south', 'west', 'north', 'east'] as const;
export type Seats = typeof ALL_SEATS;
export type Seat = Seats[number];
export type Players = {
    [seat in Seat]: string;
}

export function getPlayers(table: GameTable): Players {
    const p = table.players?.valueOf();
    if (!p) throw error(500, 'game table has no players')
    if (typeof p != 'object') throw error(500, 'game table players is not an object')
    if (Array.isArray(p)) throw error(500, "game table players should not be an array")
    const players = p as Players;
    const seats = Object.keys(players);
    if (seats.length !== 4) throw error(500, "game table players should have 4 seats")
    return p as Players
}

export function hasPlayer(players: Players, userId: string): boolean {
    return Object.values(players).indexOf(userId) !== -1;
}
