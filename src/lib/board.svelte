<script lang="ts">
	import Cell from './cell.svelte';
	import GameOver from './gameover.svelte';
	import { type InstructorMove, ToWhitePiece, type PieceState } from '$lib/types';
	import { Chess, type Square } from 'chess.js';
	import moveSelfSound from '$lib/assets/move-self.mp3';
	import captureSound from '$lib/assets/capture.mp3';

	let {
		flip = false,
		instructorMove,
		handleInvalidInstructorMove,
		onstudentmove,
		fenState = $bindable<string | null>(null)
	}: {
		flip?: boolean;
		instructorMove?: InstructorMove | null;
		handleInvalidInstructorMove: (reason: string) => void;
		onstudentmove?: (move: {
			from: { r: number; c: number };
			to: { r: number; c: number };
			fen: string;
		}) => void;
		fenState?: string | null;
	} = $props();

	const chess = new Chess();
	let boardState: (PieceState | null)[][] = $state(chess.board());

	$effect(() => {
		if (fenState != null) {
			chess.load(fenState);
		}
		boardState = chess.board();
	});

	let displayRows = $derived(flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]);
	let displayCols = [0, 1, 2, 3, 4, 5, 6, 7];

	let highlight = $state<string[]>([]);

	let selected = $state<PieceState | null>(null);
	let checkPosition = $state<{ r: number; c: number } | null>(null);
	let winner = $state<'white' | 'black' | 'draw' | null>(null);

	function squareToRowCol(sq: string): { r: number; c: number } {
		return { r: 8 - parseInt(sq[1]), c: sq.charCodeAt(0) - 97 };
	}

	function findKing(color: 'w' | 'b'): { r: number; c: number } | null {
		const squares = chess.findPiece({ type: 'k', color });
		if (!squares.length) return null;
		return squareToRowCol(squares[0]);
	}

	function moveToSquare(san: string): Square {
		const match = san.match(/[a-h][1-8]/);
		return (match ? match[0] : san) as Square;
	}

	function handleClick(r: number, c: number) {
		const piece = boardState[r][c];
		const sq = (String.fromCharCode(97 + c) + (8 - r)) as Square;

		
		if (selected == null) {
			if (!piece) return;
			if (chess.turn() !== piece.color) return;
			selected = piece;
			highlight = chess.moves({ square: sq }).map(moveToSquare);
			return;
		}

		if (selected.square === piece?.square) {
			selected = null;
			highlight = [];
			return;
		}

		if (selected.color === piece?.color && selected.square !== piece.square && piece) {
			if (chess.turn() !== piece.color) return;
			selected = piece;
			highlight = chess.moves({ square: sq }).map(moveToSquare);
			return;
		}

		const moveResult = chess.move({ from: selected.square as Square, to: sq });
		if (moveResult) {
			boardState = chess.board();
			selected = null;
			highlight = [];

			if (chess.isCheck()) {
				checkPosition = findKing(chess.turn());
			} else {
				checkPosition = null;
			}

			playSound(moveResult.captured ? 'capture' : 'move');
		}
	}

	function playSound(type: 'move' | 'capture') {
		if (typeof window === 'undefined') return;

		const audio = new Audio(type === 'move' ? moveSelfSound : captureSound);
		audio.play().catch((e) => console.error('Error playing sound:', e));
	}

	function getPieceFromBoardState(r: number, c: number): string | undefined {
		if (boardState[r][c]?.color === 'w') {
			return ToWhitePiece(boardState[r][c].type);
		}
		return boardState[r][c]?.type;
	}
</script>

<div class="board">
	<GameOver {winner} />
	{#each displayRows as r, ri (ri)}
		{#each displayCols as c, ci (ci)}
			{@const sq = (String.fromCharCode(97 + c) + (8 - r)) as Square}
			<Cell
				color={(r + c) % 2 === 0 ? 'light' : 'dark'}
				piece={getPieceFromBoardState(r, c)}
				highlight={sq ? highlight.includes(sq) : false}
				check={checkPosition?.r === r && checkPosition?.c === c}
				onclick={() => handleClick(r, c)}
			/>
		{/each}
	{/each}
</div>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		grid-template-rows: repeat(8, 1fr);
		width: 100%;
		max-width: 600px;
		aspect-ratio: 1 / 1;
		border: 5px solid #333;
		user-select: none;
		position: relative;
	}
</style>
