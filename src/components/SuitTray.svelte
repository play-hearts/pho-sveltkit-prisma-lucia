<script lang="ts">
    import type { Suit, CardType } from "$lib/cards";
    import Card from '$components/Card.svelte';
    export let cards: CardType[];
    export let legal: CardType[];
    export let suit : Suit;

    function isLegal(card: CardType): boolean {
        return legal.find(c => c.rank==card.rank && c.suit==card.suit)!==undefined;
    }
</script>

<section class="suit-tray">
{#each cards as card}
    <Card rank={card.rank} suit={suit} legal={isLegal(card)}/>
{/each}
</section>

<style>
.suit-tray {
    display: flex;
    width: auto;
    flex-wrap: nowrap;
    flex-direction: row;
    margin: 0.5vmin;
}
</style>
