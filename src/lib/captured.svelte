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

	const pieceSvgs: Record<string, string> = {
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

	const pieceOrder: Record<string, number> = {
		q: 5,
		Q: 5,
		r: 4,
		R: 4,
		b: 3,
		B: 3,
		n: 2,
		N: 2,
		p: 1,
		P: 1
	};

	let { pieces = [] }: { pieces?: string[] } = $props();

	const sortedPieces = $derived(
		[...pieces].sort((a, b) => (pieceOrder[b] ?? 0) - (pieceOrder[a] ?? 0))
	);
</script>

<div class="captured">
	{#each sortedPieces as piece, i (piece + i)}
		{#if pieceSvgs[piece]}
			<img src={pieceSvgs[piece]} alt={piece} class="piece" />
		{/if}
	{/each}
</div>

<style>
	.captured {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		align-items: center;
		padding: 4px;
		min-height: 8px;
	}

	.piece {
		width: 24px;
		height: 24px;
	}
</style>
