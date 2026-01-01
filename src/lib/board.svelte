<script lang="ts">
	import Cell from './cell.svelte';

	let position = $state([
		['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
		['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
		['', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', ''],
		['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
		['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
	]);

	let highlight = $state([
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false]
	]);

	let selected = $state<{ r: number; c: number } | null>(null);
	let turn = $state<'white' | 'black'>('white');

	function getPieceColor(piece: string): 'white' | 'black' | null {
		if (!piece) return null;
		return piece === piece.toUpperCase() ? 'white' : 'black';
	}

	function getMoves(r: number, c: number, piece: string, board: string[][]) {
		const moves: { r: number; c: number }[] = [];
		const color = getPieceColor(piece);
		if (!color) return moves;

		const type = piece.toLowerCase();

		// Directions
		const diagonals = [
			[-1, -1],
			[-1, 1],
			[1, -1],
			[1, 1]
		];
		const straights = [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1]
		];
		const knights = [
			[-2, -1],
			[-2, 1],
			[-1, -2],
			[-1, 2],
			[1, -2],
			[1, 2],
			[2, -1],
			[2, 1]
		];

		const addIfValid = (tr: number, tc: number) => {
			if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
				const target = board[tr][tc];
				const targetColor = getPieceColor(target);
				if (targetColor !== color) {
					moves.push({ r: tr, c: tc });
				}
			}
		};

		if (type === 'p') {
			const dir = color === 'white' ? -1 : 1;
			const startRow = color === 'white' ? 6 : 1;

			// Forward 1
			if (board[r + dir]?.[c] === '') {
				moves.push({ r: r + dir, c: c });
				// Forward 2
				if (r === startRow && board[r + dir * 2]?.[c] === '') {
					moves.push({ r: r + dir * 2, c: c });
				}
			}
			// Captures
			if (board[r + dir]?.[c - 1] && getPieceColor(board[r + dir][c - 1]) !== color) {
				moves.push({ r: r + dir, c: c - 1 });
			}
			if (board[r + dir]?.[c + 1] && getPieceColor(board[r + dir][c + 1]) !== color) {
				moves.push({ r: r + dir, c: c + 1 });
			}
		} else if (type === 'n') {
			knights.forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
		} else if (type === 'k') {
			[...straights, ...diagonals].forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
		} else {
			// Sliding pieces: b, r, q
			const dirs = [];
			if (type === 'b' || type === 'q') dirs.push(...diagonals);
			if (type === 'r' || type === 'q') dirs.push(...straights);

			dirs.forEach(([dr, dc]) => {
				let tr = r + dr;
				let tc = c + dc;
				while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
					const target = board[tr][tc];
					const targetColor = getPieceColor(target);

					if (targetColor === color) break; // Blocked by own piece

					moves.push({ r: tr, c: tc });

					if (targetColor !== null) break; // Capture enemy and stop

					tr += dr;
					tc += dc;
				}
			});
		}

		return moves;
	}

	function handleClick(r: number, c: number) {
		const piece = position[r][c];

		// Reset highlights
		const newHighlight = Array(8)
			.fill(null)
			.map(() => Array(8).fill(false));

		if (selected && highlight[r][c]) {
			// Move
			position[r][c] = position[selected.r][selected.c];
			position[selected.r][selected.c] = '';
			selected = null;
			highlight = newHighlight;
			turn = turn === 'white' ? 'black' : 'white';
			return;
		}

		if (selected && selected.r === r && selected.c === c) {
			selected = null;
			highlight = newHighlight;
			return;
		}

		if (piece) {
			if (getPieceColor(piece) !== turn) return; // Not your turn

			selected = { r, c };
			const moves = getMoves(r, c, piece, position);
			moves.forEach((m) => {
				newHighlight[m.r][m.c] = true;
			});
			highlight = newHighlight;
		} else {
			selected = null;
			highlight = newHighlight;
		}
	}

	let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

	let ranks = [8, 7, 6, 5, 4, 3, 2, 1];
</script>

<div class="board">
	{#each ranks as rank, r}
		{#each files as file, f}
			<Cell
				color={(r + f) % 2 === 0 ? 'light' : 'dark'}
				piece={position[r][f]}
				highlight={highlight[r][f]}
				onclick={() => handleClick(r, f)}
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
	}
</style>
