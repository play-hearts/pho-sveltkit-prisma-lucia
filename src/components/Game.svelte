<script lang="ts">
    import Trick from '$components/Trick.svelte';
    import HandTray from '$components/HandTray.svelte';
    import type  { CardHand, TrickType } from '$lib/cards';

    export let hand: CardHand;
    export let trick: TrickType;
    export let legal: CardHand;
</script>

<div class="game">
  <Trick {trick} />
  <HandTray {hand} {legal} />
</div>

<style>

  .game {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

</style>
