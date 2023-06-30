<script lang="ts">
    import { enhance } from '$app/forms';
    import { all_suits, type CardType, type Suit, type CardHand } from "$lib/cards";
    import SuitTray from '$components/SuitTray.svelte';

    export let hand: CardHand;
    export let legal: CardHand;
    let suit_cards: CardType[][];

    $: suit_cards = all_suits.map((suit: Suit): CardType[] => hand.filter((card: CardType): boolean => card.suit === suit));
    $: suit_legal = all_suits.map((suit: Suit): CardType[] => legal.filter((card: CardType): boolean => card.suit === suit));

  </script>

<form method="POST" class="hand-tray" action="?/cardclicked" use:enhance>
    {#each all_suits as suit, i}
    {#if suit_cards[i].length > 0}
      <SuitTray {suit} cards={suit_cards[i]} legal={suit_legal[i]}/>
    {/if}
    {/each}
</form>

<style>
    .hand-tray {
      width: auto;
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
    }
</style>
