<script lang="ts">
	import type { PageData } from './$types'
	;(BigInt.prototype as any)['toJSON'] = function (): string {
		return this.toString()
	}

	export let data: PageData
	$: ({ tableRound } = data)
</script>

<h2>Round {tableRound.round}</h2>
<pre>{JSON.stringify(tableRound, null, 4)}</pre>
