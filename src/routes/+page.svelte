<script lang="ts">
	import type { LayoutServerData } from './$types'
	export let data: LayoutServerData
</script>

<ul>
	<form method="POST">
		<li><a href="/">Home</a></li>
		{#if !data.user}
			<li><a href="/register">Register</a></li>
			<li><a href="/login" role="button">Login</a></li>
		{:else}
			<li>
				<button formaction="/logout" type="submit">Logout</button>
			</li>
		{/if}
	</form>
</ul>
