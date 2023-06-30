<!-- https://stackoverflow.com/questions/75642292/how-do-i-move-my-4-cards-so-they-are-aligned-in-a-diamond-shape -->

<script lang="ts">
    import Card from '$components/Card.svelte';
    import type { TrickType } from '$lib/cards';
    const disabled = {disabled: true};
    export let trick: TrickType;
  </script>

  <section class="trick">
    <div class="column west">
      <div class="slot west">
        <Card {... trick[1]} {... disabled} />
      </div>
    </div>
    <div class="column center">
      <div class="slot north">
        <Card {... trick[2]} {... disabled} />
      </div>
      <div class="slot south">
        <Card {... trick[0]} {... disabled} />
      </div>
    </div>
    <div class="column east">
      <div class="slot">
        <Card {... trick[3]} {... disabled} />
      </div>
    </div>
  </section>


  <style>

    .trick {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .column {
        display: flex;
        flex-direction: column;
   }

   .slot {
        display: flex;
        margin: 5px;
   }

   .west {
        justify-content: flex-start;
    }

    .east {
        justify-content: flex-end;
    }

  </style>
