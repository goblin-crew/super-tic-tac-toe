export interface PlayerInfo {
    peerId: string | null;
    nickName: string | null;
}

export interface GameState {
    currentPlayer: 'X' | 'O';
    nextSubBoard: number | null;
    subBoardWinners: Array<'X' | 'O' | 'Draw' | null>;
    subBoards: Array<Array<'X' | 'O' | null>>;
    winner: 'X' | 'O' | 'Draw' | null;
    players: {
        X: PlayerInfo;
        O: PlayerInfo;
    };
}