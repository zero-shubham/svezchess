import type { Piece } from './types';

export type HasMoved = {
	whiteKing: boolean;
	blackKing: boolean;
	whiteRookLeft: boolean;
	whiteRookRight: boolean;
	blackRookLeft: boolean;
	blackRookRight: boolean;
};

export function loadFEN(fen: string): {
	board: (Piece | '')[][];
	enPassantTarget: { r: number; c: number } | null;
	hasMoved: HasMoved;
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
		blackRookRight: !castling?.includes('k')
	};

	return { board: newBoard, enPassantTarget, hasMoved };
}

export function toFEN(
	board: (Piece | '')[][],
	turn: 'white' | 'black',
	enPassantTarget: { r: number; c: number } | null,
	hasMoved: HasMoved
): string {
	const placement = board
		.map((row) => {
			let str = '';
			let empty = 0;
			for (const cell of row) {
				if (cell === '') {
					empty++;
				} else {
					if (empty > 0) {
						str += empty;
						empty = 0;
					}
					str += cell;
				}
			}
			if (empty > 0) str += empty;
			return str;
		})
		.join('/');

	let castling = '';
	if (!hasMoved.whiteKing) {
		if (!hasMoved.whiteRookRight) castling += 'K';
		if (!hasMoved.whiteRookLeft) castling += 'Q';
	}
	if (!hasMoved.blackKing) {
		if (!hasMoved.blackRookRight) castling += 'k';
		if (!hasMoved.blackRookLeft) castling += 'q';
	}
	if (!castling) castling = '-';

	let ep = '-';
	if (enPassantTarget) {
		const file = String.fromCharCode(97 + enPassantTarget.c);
		const rank = 8 - enPassantTarget.r;
		ep = file + rank;
	}

	return `${placement} ${turn[0]} ${castling} ${ep} 0 1`;
}
