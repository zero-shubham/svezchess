import { describe, it, expect } from 'vitest';
import { loadFEN } from './fen';

describe('loadFEN', () => {
	it('parses starting position', () => {
		const { board } = loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

		expect(board[0]).toEqual(['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']);
		expect(board[1]).toEqual(['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p']);
		expect(board[2]).toEqual(['', '', '', '', '', '', '', '']);
		expect(board[6]).toEqual(['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P']);
		expect(board[7]).toEqual(['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']);
	});

	it('parses empty board', () => {
		const { board } = loadFEN('8/8/8/8/8/8/8/8 w - - 0 1');

		for (const row of board) {
			expect(row).toEqual(['', '', '', '', '', '', '', '']);
		}
	});

	it('parses mixed pieces and empty squares', () => {
		const { board } = loadFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');

		expect(board[0][0]).toBe('r');
		expect(board[0][1]).toBe('');
		expect(board[0][2]).toBe('');
		expect(board[0][3]).toBe('');
		expect(board[0][4]).toBe('k');
		expect(board[0][7]).toBe('r');
	});

	it('ignores FEN parts beyond placement', () => {
		const { board: board1 } = loadFEN('8/8/8/8/8/8/8/8 w - - 0 1');
		const { board: board2 } = loadFEN('8/8/8/8/8/8/8/8 b KQkq e3 0 1');

		expect(board1).toEqual(board2);
	});

	it('handles FEN without trailing parts', () => {
		const { board } = loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');

		expect(board[0][4]).toBe('k');
		expect(board[7][4]).toBe('K');
	});

	it('returns 8x8 board', () => {
		const { board } = loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

		expect(board.length).toBe(8);
		for (const row of board) {
			expect(row.length).toBe(8);
		}
	});

	it('returns null enPassantTarget for "-"', () => {
		const { enPassantTarget } = loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

		expect(enPassantTarget).toBeNull();
	});

	it('parses enPassantTarget correctly', () => {
		const { enPassantTarget } = loadFEN(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
		);

		expect(enPassantTarget).toEqual({ r: 5, c: 4 });
	});

	it('parses enPassantTarget on queenside', () => {
		const { enPassantTarget } = loadFEN(
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPP1PP/RNBQKBNR w KQkq b6 0 2'
		);

		expect(enPassantTarget).toEqual({ r: 2, c: 1 });
	});

	it('returns all hasMoved false when full castling available', () => {
		const { hasMoved } = loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

		expect(hasMoved).toEqual({
			whiteKing: false,
			blackKing: false,
			whiteRookLeft: false,
			whiteRookRight: false,
			blackRookLeft: false,
			blackRookRight: false
		});
	});

	it('returns hasMoved true when no castling available', () => {
		const { hasMoved } = loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1');

		expect(hasMoved).toEqual({
			whiteKing: true,
			blackKing: true,
			whiteRookLeft: true,
			whiteRookRight: true,
			blackRookLeft: true,
			blackRookRight: true
		});
	});

	it('parses partial castling rights', () => {
		const { hasMoved } = loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1');

		expect(hasMoved.whiteKing).toBe(false);
		expect(hasMoved.whiteRookRight).toBe(false);
		expect(hasMoved.whiteRookLeft).toBe(false);
		expect(hasMoved.blackKing).toBe(true);
		expect(hasMoved.blackRookRight).toBe(true);
		expect(hasMoved.blackRookLeft).toBe(true);
	});
});
