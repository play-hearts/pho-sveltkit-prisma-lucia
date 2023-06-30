<script lang="ts">
	import Game from '$components/Game.svelte'
	import { onMount } from 'svelte'
	import { kEmptyTrick, type TrickType, type VisibleState } from '$lib/cards'
    import { page } from '$app/stores';
	import { parse } from 'devalue'

	let visibleState: VisibleState | undefined = undefined;
	$: hand = visibleState?.hand || [];
	$: trick = visibleState?.trick || (kEmptyTrick as TrickType);
	$: legal = visibleState?.legal || [];

	type VoidCallback = () => void

	function subscribe(): VoidCallback {
		const path = $page.url.pathname;
		console.log('current URL:', path)
		const sse = new EventSource(`${path}/subscribe`);
		const { url } = sse;
		console.log(`Subscribed to ${url}`);
		sse.onmessage = (ev) => {
			visibleState = parse(ev.data) as VisibleState;
			console.log('onMessage', typeof visibleState, visibleState);
			if (visibleState.state === 'DONE') {
				console.log('Finished round')
			}
		}
		const unsubscribe: VoidCallback = (): void => { sse.close(); console.log('EventSource closed');}
		return unsubscribe;
	}

	onMount(subscribe);
</script>

<Game {hand} {trick} {legal} />
