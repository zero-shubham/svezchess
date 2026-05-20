export type BlackPiece = 'r' | 'n' | 'b' | 'q' | 'k' | 'p';
export type WhitePiece = 'R' | 'N' | 'B' | 'Q' | 'K' | 'P';
export type Piece = BlackPiece | WhitePiece;

export type InstructorMove = {
	currentPosition: [number, number];
	movePosition: [number, number];
};
