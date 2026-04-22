<script lang="ts">
	import bishopB from '$lib/assets/bishop-b.svg';
	import bishopW from '$lib/assets/bishop-w.svg';
	import knightB from '$lib/assets/knight-b.svg';
	import knightW from '$lib/assets/knight-w.svg';
	import queenB from '$lib/assets/queen-b.svg';
	import queenW from '$lib/assets/queen-w.svg';
	import rookB from '$lib/assets/rook-b.svg';
	import rookW from '$lib/assets/rook-w.svg';

	import type { Piece } from '$lib/types';

	// Receive props
	let { color = 'white', onSelect } = $props<{
		color: 'white' | 'black';
		onSelect: (piece: Piece) => void;
	}>();

	const options = [
		{ type: 'q', white: queenW, black: queenB },
		{ type: 'r', white: rookW, black: rookB },
		{ type: 'b', white: bishopW, black: bishopB },
		{ type: 'n', white: knightW, black: knightB }
	];

	function getIcon(option: (typeof options)[0]) {
		return color === 'white' ? option.white : option.black;
	}

	function getPieceCode(type: Piece) {
		return color === 'white' ? type.toUpperCase() : type;
	}
</script>

<div class="promotion-overlay">
	<div class="promotion-container">
		<p class="title">Promote Pawn</p>
		<div class="options">
			{#each options as option, i (i)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="option" onclick={() => onSelect(getPieceCode(option.type as Piece))}>
					<img src={getIcon(option)} alt={option.type} />
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.promotion-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 200;
	}

	.promotion-container {
		background-color: #ebf4dd; /* Light square color */
		padding: 20px;
		border-radius: 8px;
		border: 5px solid #333;
		text-align: center;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.title {
		margin: 0 0 15px 0;
		font-family: 'Press Start 2P', system-ui;
		color: #333;
		font-size: 1rem;
	}

	.options {
		display: flex;
		gap: 15px;
	}

	.option {
		width: 60px;
		height: 60px;
		border: 2px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition:
			transform 0.1s,
			background-color 0.1s;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.option:hover {
		transform: scale(1.1);
		background-color: rgba(0, 0, 0, 0.1);
		border-color: #90ab8b;
	}

	.option img {
		width: 90%;
		height: 90%;
	}
</style>
