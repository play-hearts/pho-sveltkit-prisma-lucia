<script lang="ts">
    import type { Rank, Suit } from "$lib/cards";
	import { stringify } from "devalue"
    export let rank : Rank | "";
    export let suit : Suit | "";
    export let disabled : boolean = false;
    export let legal : boolean = false;
    $: imageUrl = rank!=="" && suit!=="" ? `/cards/${suit}_${rank}.svg` : "/cards/blank_card.svg";
    $: alt = rank!=="" && suit!=="" ? `${rank} of ${suit}` : "no card";
    $: card = {rank, suit}
</script>

{#if disabled || !legal}
    <img src="{imageUrl}" {alt} class="dim"/>
{:else}
    <button class="card-btn" type="submit" name="card" value={`${stringify(card)}`}>
        <img src="{imageUrl}" {alt}/>
    </button>
{/if}

<style>
    img {
        aspect-ratio: 1 / 1.4;
        width: var(--card-width, 10vmin);
        height: var(--card-height, 14vmin);
        margin: 0.25vmin;
    }

    img.dim {
        filter: brightness(0.95);
    }

    img[src="/cards/blank_card.svg"] {
        filter: brightness(0.92);
    }

    img[src^="/cards/"] {
        border-radius: 0.5vmin;
        box-shadow: 0 0 0.5vmin 0.25vmin rgba(0, 0, 0, 0.25);
    }

    .card-btn {
        background: none;
        border: none;
        padding: 0;
        margin: 0;
    }

    .card-btn:hover {
        transform: scale(1.05);
    }

</style>
