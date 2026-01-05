<script lang="ts">
	import Cell from './cell.svelte';
	import GameOver from './gameover.svelte';
	import PawnPromotion from './pawnprom.svelte';
	import moveSelfSound from '$lib/assets/move-self.mp3';
	import captureSound from '$lib/assets/capture.mp3';

	let { flip = false } = $props();

	let displayRows = $derived(flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]);
	let displayCols = [0, 1, 2, 3, 4, 5, 6, 7];

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
	let checkPosition = $state<{ r: number; c: number } | null>(null);
	let checkColor = $state<'white' | 'black' | null>(null);
	let winner = $state<'white' | 'black' | 'draw' | null>(null);

	let whiteKingPos = $state<{ r: number; c: number }>({ r: 7, c: 4 });
	let blackKingPos = $state<{ r: number; c: number }>({ r: 0, c: 4 });
	let enPassantTarget = $state<{ r: number; c: number } | null>(null);

	let promotionPending = $state(false);
	let promotionSquare = $state<{ r: number; c: number } | null>(null);
	let promotionColor = $state<'white' | 'black'>('white');

	let hasMoved = $state({
		whiteKing: false,
		blackKing: false,
		whiteRookLeft: false,
		whiteRookRight: false,
		blackRookLeft: false,
		blackRookRight: false
	});

	function getPieceColor(piece: string): 'white' | 'black' | null {
		if (!piece) return null;
		return piece === piece.toUpperCase() ? 'white' : 'black';
	}

	function addCastlingMoves(
		color: 'white' | 'black',
		board: string[][],
		moves: { r: number; c: number }[]
	) {
		const isWhite = color === 'white';
		const row = isWhite ? 7 : 0;
		const kingMoved = isWhite ? hasMoved.whiteKing : hasMoved.blackKing;
		const rookRightMoved = isWhite ? hasMoved.whiteRookRight : hasMoved.blackRookRight;
		const rookLeftMoved = isWhite ? hasMoved.whiteRookLeft : hasMoved.blackRookLeft;
		const rookChar = isWhite ? 'R' : 'r';

		if (kingMoved) return;

		// Kingside
		if (
			!rookRightMoved &&
			board[row][5] === '' &&
			board[row][6] === '' &&
			board[row][7] === rookChar
		) {
			if (
				!isKingInCheck(color, board, { r: row, c: 4 }) &&
				!isKingInCheck(color, board, { r: row, c: 5 }) &&
				!isKingInCheck(color, board, { r: row, c: 6 })
			) {
				moves.push({ r: row, c: 6 });
			}
		}

		// Queenside
		if (
			!rookLeftMoved &&
			board[row][1] === '' &&
			board[row][2] === '' &&
			board[row][3] === '' &&
			board[row][0] === rookChar
		) {
			if (
				!isKingInCheck(color, board, { r: row, c: 4 }) &&
				!isKingInCheck(color, board, { r: row, c: 3 }) &&
				!isKingInCheck(color, board, { r: row, c: 2 })
			) {
				moves.push({ r: row, c: 2 });
			}
		}
	}

	function getMoves(
		r: number,
		c: number,
		piece: string,
		board: string[][],
		includeCastling = true
	) {
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

			// En Passant
			if (enPassantTarget) {
				if (
					enPassantTarget.r === r + dir &&
					Math.abs(enPassantTarget.c - c) === 1 &&
					board === position
				) {
					moves.push({ r: enPassantTarget.r, c: enPassantTarget.c });
				}
			}
		} else if (type === 'n') {
			knights.forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
		} else if (type === 'k') {
			[...straights, ...diagonals].forEach(([dr, dc]) => addIfValid(r + dr, c + dc));

			if (includeCastling && board === position) {
				addCastlingMoves(color, board, moves);
			}
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

	function playSound(type: 'move' | 'capture') {
		if (typeof window === 'undefined') return;

		const audio = new Audio(type === 'move' ? moveSelfSound : captureSound);
		audio.play().catch((e) => console.error('Error playing sound:', e));
	}

	function isKingInCheck(
		color: 'white' | 'black',
		board: string[][],
		kingPosOverride?: { r: number; c: number }
	): boolean {
		let kingPos = kingPosOverride;

		if (!kingPos) {
			// If we are checking the main board, use the cached state
			if (board === position) {
				kingPos = color === 'white' ? whiteKingPos : blackKingPos;
			} else {
				// If board is simulated and no override provided, find king
				const kingPiece = color === 'white' ? 'K' : 'k';
				kingPos = { r: -1, c: -1 };
				for (let i = 0; i < 8; i++) {
					for (let j = 0; j < 8; j++) {
						if (board[i][j] === kingPiece) {
							kingPos = { r: i, c: j };
							break;
						}
					}
					if (kingPos.r !== -1) break;
				}
				// If king not found (captured?), return false or handle error.
				// In standard chess king cannot be captured, but for safety:
				if (kingPos.r === -1) return false;
			}
		}

		const opponentColor = color === 'white' ? 'black' : 'white';

		// Check if any opponent piece attacks kingPos
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				const piece = board[i][j];
				if (piece && getPieceColor(piece) === opponentColor) {
					const moves = getMoves(i, j, piece, board, false);
					if (moves.some((m) => m.r === kingPos!.r && m.c === kingPos!.c)) {
						return true;
					}
				}
			}
		}

		return false;
	}

	function checkGameOver() {
		const currentPlayer = turn;
		let hasValidMoves = false;

		// Iterate through all pieces of the current player
		for (let r = 0; r < 8; r++) {
			for (let c = 0; c < 8; c++) {
				const piece = position[r][c];
				if (piece && getPieceColor(piece) === currentPlayer) {
					const moves = getMoves(r, c, piece, position);

					// Check if any move is valid (doesn't result in check)
					for (const m of moves) {
						const tempBoard = position.map((row) => [...row]);
						tempBoard[m.r][m.c] = piece;
						tempBoard[r][c] = '';

						// Handle En Passant in simulation
						if (piece.toLowerCase() === 'p' && enPassantTarget) {
							if (m.r === enPassantTarget.r && m.c === enPassantTarget.c) {
								const capturedPawnRow = turn === 'white' ? m.r + 1 : m.r - 1;
								tempBoard[capturedPawnRow][m.c] = '';
							}
						}

						let tempKingPos: { r: number; c: number };
						if (piece.toLowerCase() === 'k') {
							tempKingPos = { r: m.r, c: m.c };
						} else {
							tempKingPos = currentPlayer === 'white' ? whiteKingPos : blackKingPos;
						}

						if (!isKingInCheck(currentPlayer, tempBoard, tempKingPos)) {
							hasValidMoves = true;
							break;
						}
					}
					if (hasValidMoves) break;
				}
			}
			if (hasValidMoves) break;
		}

		if (!hasValidMoves) {
			if (checkColor === currentPlayer) {
				// Checkmate
				winner = currentPlayer === 'white' ? 'black' : 'white';
			} else {
				// Stalemate
				winner = 'draw';
			}
		}
	}

	function handleCheckPosition() {
		const opponentColor = turn === 'white' ? 'black' : 'white';

		if (isKingInCheck(opponentColor, position)) {
			checkPosition = opponentColor === 'white' ? whiteKingPos : blackKingPos;
			checkColor = opponentColor;
		} else {
			checkPosition = null;
			checkColor = null;
		}
	}

	function handlePromotion(pieceCode: string) {
		if (promotionSquare) {
			position[promotionSquare.r][promotionSquare.c] = pieceCode;
			playSound('move');

			handleCheckPosition();

			// Switch turn first, then check for game over for the *new* current player
			turn = turn === 'white' ? 'black' : 'white';

			checkGameOver();
		}

		// Reset Promotion State
		promotionPending = false;
		promotionSquare = null;
	}

	function handleClick(r: number, c: number) {
		const piece = position[r][c];

		// Reset highlights
		const newHighlight = Array(8)
			.fill(null)
			.map(() => Array(8).fill(false));

		if (selected && highlight[r][c]) {
			// Move
			const isCapture = position[r][c] !== '';
			const movingPiece = position[selected.r][selected.c];
			playSound(isCapture ? 'capture' : 'move');

			let moveEnPassantTarget = null;

			// Handle En Passant Capture
			if (
				movingPiece.toLowerCase() === 'p' &&
				enPassantTarget &&
				r === enPassantTarget.r &&
				c === enPassantTarget.c
			) {
				const capturedPawnRow = turn === 'white' ? r + 1 : r - 1;
				position[capturedPawnRow][c] = '';
				playSound('capture');
			}

			// Handle Double Pawn Push (Set En Passant Target)
			if (movingPiece.toLowerCase() === 'p' && Math.abs(r - selected.r) === 2) {
				moveEnPassantTarget = { r: (r + selected.r) / 2, c };
			}

			// Handle Castling Move
			if (movingPiece.toLowerCase() === 'k' && Math.abs(c - selected.c) === 2) {
				const isKingside = c > selected.c;
				const rookCol = isKingside ? 7 : 0;
				const rookTargetCol = isKingside ? 5 : 3;
				// Move Rook
				const rookPiece = position[r][rookCol];
				position[r][rookTargetCol] = rookPiece;
				position[r][rookCol] = '';
			}

			// Update King Position and hasMoved flags
			if (movingPiece === 'K') {
				whiteKingPos = { r, c };
				hasMoved.whiteKing = true;
			} else if (movingPiece === 'k') {
				blackKingPos = { r, c };
				hasMoved.blackKing = true;
			} else if (movingPiece === 'R') {
				if (selected.r === 7 && selected.c === 0) hasMoved.whiteRookLeft = true;
				if (selected.r === 7 && selected.c === 7) hasMoved.whiteRookRight = true;
			} else if (movingPiece === 'r') {
				if (selected.r === 0 && selected.c === 0) hasMoved.blackRookLeft = true;
				if (selected.r === 0 && selected.c === 7) hasMoved.blackRookRight = true;
			}

			position[r][c] = movingPiece;
			position[selected.r][selected.c] = '';
			enPassantTarget = moveEnPassantTarget;

			// Handle Pawn Promotion
			if (movingPiece === 'P' && r === 0) {
				promotionPending = true;
				promotionSquare = { r, c };
				promotionColor = 'white';
				selected = null;
				highlight = newHighlight;
				return;
			}
			if (movingPiece === 'p' && r === 7) {
				promotionPending = true;
				promotionSquare = { r, c };
				promotionColor = 'black';
				selected = null;
				highlight = newHighlight;
				return;
			}

			handleCheckPosition();

			// Switch turn first, then check for game over for the *new* current player
			turn = turn === 'white' ? 'black' : 'white';

			checkGameOver();

			selected = null;
			highlight = newHighlight;
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

			// Filter moves that leave/put king in check
			moves.forEach((m) => {
				// Simulate move
				const tempBoard = position.map((row) => [...row]);
				tempBoard[m.r][m.c] = piece;
				tempBoard[r][c] = '';

				// Handle En Passant in simulation
				if (piece.toLowerCase() === 'p' && enPassantTarget) {
					if (m.r === enPassantTarget.r && m.c === enPassantTarget.c) {
						const capturedPawnRow = turn === 'white' ? m.r + 1 : m.r - 1;
						tempBoard[capturedPawnRow][m.c] = '';
					}
				}

				// Determine where the king is on the temp board
				let tempKingPos: { r: number; c: number };
				if (piece.toLowerCase() === 'k') {
					tempKingPos = { r: m.r, c: m.c };
				} else {
					tempKingPos = turn === 'white' ? whiteKingPos : blackKingPos;
				}

				if (!isKingInCheck(turn, tempBoard, tempKingPos)) {
					newHighlight[m.r][m.c] = true;
				}
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
	<GameOver {winner} />
	{#if promotionPending}
		<PawnPromotion color={promotionColor} onSelect={handlePromotion} />
	{/if}
	{#each displayRows as r}
		{#each displayCols as c}
			<Cell
				color={(r + c) % 2 === 0 ? 'light' : 'dark'}
				piece={position[r][c]}
				highlight={highlight[r][c]}
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
