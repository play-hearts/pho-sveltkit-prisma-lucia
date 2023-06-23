<script lang="ts">
	import type { PageData } from './$types'
	export let data: PageData
	$: ({ gameTables } = data)
</script>

<div class="grid">
	<div>
		<h2>Game Tables:</h2>
		<ul>
			{#each gameTables as gameTable}
				<li>
					<a href="pho/{gameTable.id}" role="button" class="outline constrast" style="width: 100%;">
						Game {gameTable.id}
					</a>
				</li>
			{/each}
		</ul>
	</div>
	{#if data.user}
		<form action="?/createGameTable" method="POST">
			<h3>Set up the game:</h3>
			<label for="variant"> Game Variant </label>
			<input type="text" id="variant" name="variant" value="STANDARD" />
			<label for="west"> west </label>
			<input type="text" id="west" name="west" value="random" />
			<label for="north"> north </label>
			<input type="text" id="north" name="north" value="random" />
			<label for="east"> east </label>
			<input type="text" id="east" name="east" value="random" />
			<button type="submit">Create game</button>
		</form>
	{/if}
</div>
