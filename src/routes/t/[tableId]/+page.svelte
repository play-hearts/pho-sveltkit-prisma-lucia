<script lang="ts">
	import type { PageData } from './$types'
	import type { Players } from '$lib/players.js'

	export let data: PageData
	$: ({ gameTable } = data)
	$: ({ west, north, east } = gameTable.players as Players)
</script>

<form action="?/startTable" method="POST">
	<h3>Set up game {gameTable.id}:</h3>
	<label for="variant"> Game Variant </label>
	<input type="text" id="variant" name="variant" value={gameTable.variant} />
	<label for="west"> west </label>
	<input type="text" id="west" name="west" value={west || 'random'} />
	<label for="north"> north </label>
	<input type="text" id="north" name="north" value={north || 'random'} />
	<label for="east"> east </label>
	<input type="text" id="east" name="east" value={east || 'random'} />
	<button type="submit">Start game</button>
</form>
