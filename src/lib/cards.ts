// Path: src/lib/cards.ts

// The strings in all_suits and all_ranks are used in the SVG image filenames.
// The UI shouldn't need to even know the ordering of either the suits or the ranks,
// i.e. it should need to know that ace > king > queen ...;
// nor should it need to know that hearts > spades > diamonds > clubs.
// However game logic does depend on this ordering, so there will be some need for translation, TBD.

export const all_suits = ['clubs', 'diamonds', 'spades', 'hearts'] as const;
export type Suit = typeof all_suits[number];

export const all_ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'] as const;
export type Rank = typeof all_ranks[number];

export type CardType = {
    suit: Suit;
    rank: Rank;
};

export const kNoCard = { suit: "", rank: "" } as const;
export type NoCard = typeof kNoCard;

export type TrickCard = {
    suit: Suit | "";
    rank: Rank | "";
};

export type TrickType = [TrickCard, TrickCard, TrickCard, TrickCard];
export const kEmptyTrick = [kNoCard, kNoCard, kNoCard, kNoCard] as const;

export type CardHand = CardType[];
export type FourHands = [CardHand, CardHand, CardHand, CardHand];

export const all_seat_names = ['south', 'west', 'north', 'east'] as const;
export type SeatName = typeof all_seat_names[number];

export function seatPosition(seat: SeatName): number {
    return all_seat_names.indexOf(seat);
}

export function seatName(seat: number): SeatName {
    return all_seat_names[seat];
}

export const kSouthNumber = seatPosition('south');
export const kWestNumber = seatPosition('west');
export const kNorthNumber = seatPosition('north');
export const kEastNumber = seatPosition('east');

export function ordToCard(ord: number): CardType {
    const suit = all_suits[Math.floor(ord / 13)];
    const rank = all_ranks[ord % 13];
    return { suit, rank };
}

export function cardTypeToOrd(card: CardType): number {
    const suit = card.suit;
    const rank = card.rank;
    const suit_ord = all_suits.indexOf(suit);
    const rank_ord = all_ranks.indexOf(rank);
    if (suit_ord < 0 || rank_ord < 0) throw new Error(`cardTypeToOrd(${card})`);
    return suit_ord * 13 + rank_ord;
}

export function ordToTrickCard(ord: number): TrickCard {
    if (ord == 63) return kNoCard;
    return ordToCard(ord);
}

// VisibleState

// The trick and hand must always be present.
// The trick may be the empty trick
// The hand is the set of cards currently remaining in the player's hand and visible in the 'tray'
// Cards from the hand that are legal to click should be also contained in `legal`.
// Cards that are not legal to click should be dimmed slightly to indicate they are not legal.
// If `legal` is not present then no cards are clickable. This should be the case when it is not
// `south`'s turn.
// During passing we need to be able to choose three cards. Each click on card immediately
// posts a click. The server will respond with a VisibleState that has that card in `selected`
// unless it is the third card to be selected, in which case the click is treated has completing
// the pass selection.
// Selected cards should be somehow highlighted.
// Note that selected cards should remain clickable. Clicking a selected card deselects it.

export type VisibleState = {
    state: 'BIDDING' | 'PLAYING' | 'DONE'
    trick: TrickType
    hand: CardHand
    legal?: CardHand
    selected?: CardHand
};
