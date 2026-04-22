import type { Piece } from './types';

export function loadFEN(fen: string): {
	board: (Piece | '')[][];
	enPassantTarget: { r: number; c: number } | null;
	hasMoved: {
		whiteKing: boolean;
		blackKing: boolean;
		whiteRookLeft: boolean;
		whiteRookRight: boolean;
		blackRookLeft: boolean;
		blackRookRight: boolean;
	};
} {
	const parts = fen.trim().split(/\s+/);
	const [placement, , castling, enPassant] = parts;

	const rows = placement.split('/');
	const newBoard: (Piece | '')[][] = [];
	for (let r = 0; r < 8; r++) {
		const row: (Piece | '')[] = [];
		for (const char of rows[r]) {
			if (/\d/.test(char)) {
				for (let i = 0; i < parseInt(char); i++) row.push('');
			} else {
				row.push(char as Piece);
			}
		}
		newBoard.push(row);
	}

	let enPassantTarget: { r: number; c: number } | null = null;
	if (enPassant && enPassant !== '-') {
		const file = enPassant.charCodeAt(0) - 97;
		const rank = 8 - parseInt(enPassant[1]);
		enPassantTarget = { r: rank, c: file };
	}

	const hasMoved = {
		whiteKing: !castling?.includes('K'),
		blackKing: !castling?.includes('k'),
		whiteRookLeft: !castling?.includes('Q'),
		whiteRookRight: !castling?.includes('K'),
		blackRookLeft: !castling?.includes('q'),
		blackRookRight: !castling?.includes('k'),
	};

	return { board: newBoard, enPassantTarget, hasMoved };
}
