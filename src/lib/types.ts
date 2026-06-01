import { type Square} from 'chess.js'

export type BlackPiece = 'r' | 'n' | 'b' | 'q' | 'k' | 'p';
export type WhitePiece = 'R' | 'N' | 'B' | 'Q' | 'K' | 'P';
export type Piece = BlackPiece | WhitePiece;

export function ToWhitePiece(p: BlackPiece): WhitePiece {
	switch(p){
		case 'b': return 'B';
		case 'k': return 'K';
		case 'n': return 'N';
		case 'p': return 'P';
		case 'q': return 'Q';
		case 'r': return 'R';
	}
}

export type InstructorMove = {
	san: string;
	fen: string;
};

export type PieceState = {
	type: BlackPiece,
	square: Square,
	color: 'w'|'b'
}