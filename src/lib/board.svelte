<script lang="ts">
	import Cell from './cell.svelte';
	import GameOver from './gameover.svelte';
	import PawnPromotion from './pawnprom.svelte';
	import { type InstructorMove, ToWhitePiece, type PieceState, type Piece } from '$lib/types';
	import { Chess, type Square } from 'chess.js';
	import moveSelfSound from '$lib/assets/move-self.mp3';
	import captureSound from '$lib/assets/capture.mp3';

	let {
		flip = false,
		instructorMove,
		handleInvalidInstructorMove,
		onstudentmove,
		oncapture,
		fenState = $bindable<string | null>(null)
	}: {
		flip?: boolean;
		instructorMove?: InstructorMove | null;
		handleInvalidInstructorMove: (reason: string) => void;
		onstudentmove?: (san: string, fen: string) => void;
		oncapture?: (captured: { white?: string; black?: string }) => void;
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

	$effect(() => {
		if (!instructorMove?.san) return;
		const moveResult = chess.move(instructorMove.san);
		if (!moveResult) {
			handleInvalidInstructorMove(`chess.js rejected move "${instructorMove.san}"`);
			return;
		}
		boardState = chess.board();
		playSound(moveResult.captured ? 'capture' : 'move');
		if (moveResult.captured && oncapture) {
			if (moveResult.color === 'w') {
				oncapture({ white: moveResult.captured });
			} else {
				oncapture({
					black: ToWhitePiece(moveResult.captured as 'r' | 'n' | 'b' | 'q' | 'k' | 'p')
				});
			}
		}
		if (chess.isCheck()) {
			checkPosition = findKing(chess.turn());
		} else {
			checkPosition = null;
		}
		if (chess.isGameOver()) {
			if (chess.isCheckmate()) {
				winner = chess.turn() === 'w' ? 'black' : 'white';
			} else {
				winner = 'draw';
			}
		}
		const currentFen = chess.fen({ forceEnpassantSquare: true });
		if (instructorMove.fen && currentFen !== instructorMove.fen) {
			handleInvalidInstructorMove(
				`FEN mismatch after move "${instructorMove.san}": expected "${instructorMove.fen}", got "${currentFen}"`
			);
		}
	});

	let displayRows = $derived(flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]);
	let displayCols = [0, 1, 2, 3, 4, 5, 6, 7];

	let highlight = $state<string[]>([]);

	let selected = $state<PieceState | null>(null);
	let checkPosition = $state<{ r: number; c: number } | null>(null);
	let winner = $state<'white' | 'black' | 'draw' | null>(null);

	let promotionPending = $state(false);
	let promotionFrom = $state<Square | null>(null);
	let promotionSquare = $state<Square | null>(null);
	let promotionColor = $state<'w' | 'b'>('w');

	function squareToRowCol(sq: string): { r: number; c: number } {
		return { r: 8 - parseInt(sq[1]), c: sq.charCodeAt(0) - 97 };
	}

	function findKing(color: 'w' | 'b'): { r: number; c: number } | null {
		const squares = chess.findPiece({ type: 'k', color });
		if (!squares.length) return null;
		return squareToRowCol(squares[0]);
	}

	function handleClick(r: number, c: number) {
		const piece = boardState[r][c];
		const sq = (String.fromCharCode(97 + c) + (8 - r)) as Square;

		if (selected == null) {
			if (!piece) return;
			if (chess.turn() !== piece.color) return;
			selected = piece;
			highlight = chess.moves({ square: sq, verbose: true }).map((m) => m.to);
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
			highlight = chess.moves({ square: sq, verbose: true }).map((m) => m.to);
			return;
		}

		if (selected.type === 'p' && (sq[1] === '8' || sq[1] === '1')) {
			promotionFrom = selected.square as Square;
			promotionSquare = sq;
			promotionColor = selected.color;
			promotionPending = true;
			selected = null;
			highlight = [];
			return;
		}

		makeMove(selected.square as Square, sq);
		selected = null;
		highlight = [];
	}

	function handlePromotion(pieceCode: Piece) {
		if (!promotionFrom || !promotionSquare) return;

		makeMove(promotionFrom, promotionSquare, pieceCode.toLowerCase() as 'q' | 'r' | 'b' | 'n');

		promotionPending = false;
		promotionFrom = null;
		promotionSquare = null;
	}

	function makeMove(from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') {
		const moveResult = chess.move({ from, to, promotion });
		if (!moveResult) return false;
		boardState = chess.board();

		if (onstudentmove) {
			onstudentmove(moveResult.san, chess.fen({ forceEnpassantSquare: true }));
		}

		playSound(moveResult.captured ? 'capture' : 'move');
		if (moveResult.captured && oncapture) {
			if (moveResult.color === 'w') {
				oncapture({ white: moveResult.captured });
			} else {
				oncapture({
					black: ToWhitePiece(moveResult.captured as 'r' | 'n' | 'b' | 'q' | 'k' | 'p')
				});
			}
		}

		if (chess.isCheck()) {
			checkPosition = findKing(chess.turn());
		} else {
			checkPosition = null;
		}

		if (chess.isGameOver()) {
			if (chess.isCheckmate()) {
				winner = chess.turn() === 'w' ? 'black' : 'white';
			} else {
				winner = 'draw';
			}
		}

		return true;
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
	{#if promotionPending}
		<PawnPromotion color={promotionColor === 'w' ? 'white' : 'black'} onSelect={handlePromotion} />
	{/if}
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
