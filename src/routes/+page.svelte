<script lang="ts">
	import type { PageData } from './$types'
	import StrategyMenu from '$components/StrategyMenu.svelte'
	import VariantMenu from '$components/VariantMenu.svelte'
	export let data: PageData
	$: ({ gameTables } = data)
</script>

<div class="grid">
	<div>
		<h2>Open Game Tables:</h2>
		<ul>
			{#each gameTables as gameTable}
				<li>
					<a href={`/t?t=${gameTable.id}&r=0`} role="button" class="outline constrast" style="width: 100%;">
						Game {gameTable.id}
					</a>
				</li>
			{/each}
		</ul>
	</div>
	{#if data.user}
		<form action="?/createGameTable" method="POST">
			<h3>Create a new game table:</h3>
			<VariantMenu value="STANDARD"/>
			<StrategyMenu seat="west" />
			<StrategyMenu seat="north" />
			<StrategyMenu seat="east" />
			<button type="submit">Create game table</button>
		</form>
	{/if}
</div>
