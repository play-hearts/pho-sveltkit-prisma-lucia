<script lang="ts">
	import '@picocss/pico'
	import type { LayoutServerData } from './$types'
	export let data: LayoutServerData
</script>

<div class="container-fluid">
	<nav class="container-fluid">
		<ul>
			<li>
				<strong>
					<a href="/"> Play Hearts Online </a>
				</strong>
			</li>
		</ul>
		<ul>
			{#if !data.user}
				<li><a href="/register">Register</a></li>
				<li><a href="/login">Login</a></li>
			{:else}
				<li>
					<a href="/logout">Logout</a>
				</li>
			{/if}
		</ul>
	</nav>
	<main class="container-fluid">
		<slot />
	</main>
</div>
