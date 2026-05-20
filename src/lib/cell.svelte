<script lang="ts">
	import bishopB from '$lib/assets/bishop-b.svg';
	import bishopW from '$lib/assets/bishop-w.svg';
	import kingB from '$lib/assets/king-b.svg';
	import kingW from '$lib/assets/king-w.svg';
	import knightB from '$lib/assets/knight-b.svg';
	import knightW from '$lib/assets/knight-w.svg';
	import pawnB from '$lib/assets/pawn-b.svg';
	import pawnW from '$lib/assets/pawn-w.svg';
	import queenB from '$lib/assets/queen-b.svg';
	import queenW from '$lib/assets/queen-w.svg';
	import rookB from '$lib/assets/rook-b.svg';
	import rookW from '$lib/assets/rook-w.svg';

	const pieces: Record<string, string> = {
		b: bishopB,
		B: bishopW,
		k: kingB,
		K: kingW,
		n: knightB,
		N: knightW,
		p: pawnB,
		P: pawnW,
		q: queenB,
		Q: queenW,
		r: rookB,
		R: rookW
	};

	export let color: 'light' | 'dark';
	export let piece: string = '';
	export let highlight: boolean = false;
	export let check: boolean = false;
	export let onclick: () => void = () => {};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- https://colorhunt.co/palette/ebf4dd90ab8b5a78633b4953 -->
<div class="square {color}" class:check {onclick}>
	{#if pieces[piece]}
		<img src={pieces[piece]} alt={piece} class="piece" />
	{/if}
	{#if highlight}
		<div class="highlight-marker" class:capture={!!pieces[piece]}></div>
	{/if}
</div>

<style>
	.square {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.square:hover {
		cursor: pointer;
		filter: brightness(1.1);
	}

	.highlight-marker {
		position: absolute;
		width: 30%;
		height: 30%;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.2);
		pointer-events: none;
	}

	.highlight-marker.capture {
		width: 85%;
		height: 85%;
		background-color: transparent;
		border: 5px solid var(--color-dark-accent);
	}

	.light {
		background-color: #ebf4dd;
	}

	.dark {
		background-color: var(--color-dark-square);
	}

	.check {
		background-color: var(--color-error) !important;
	}

	.piece {
		width: 90%;
		height: 90%;
	}
</style>
