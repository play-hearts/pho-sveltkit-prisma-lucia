<script lang="ts">
	import type { PageData } from './$types'
	import type { Players } from '$lib/players.js'
	import StrategyMenu from '$components/StrategyMenu.svelte'
	import VariantMenu from '$components/VariantMenu.svelte'

	export let data: PageData
	$: ({ gameTable } = data)
	$: ({ west, north, east } = gameTable.players as Players)
</script>

<form action="?/startTable" method="POST">
	<h4>Start game:</h4>
	<VariantMenu value="{gameTable.variant}"/>
	<StrategyMenu seat="{west}" />
	<StrategyMenu seat="{north}" />
	<StrategyMenu seat="{east}" />
<button type="submit">Start game</button>
</form>
