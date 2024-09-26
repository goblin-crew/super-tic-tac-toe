import React from 'react';
import SubBoard from './SubBoard';

interface GameState {
    currentPlayer: 'X' | 'O';
    nextSubBoard: number | null;
    subBoardWinners: Array<'X' | 'O' | 'Draw' | null>;
    subBoards: Array<Array<'X' | 'O' | null>>;
    winner: 'X' | 'O' | 'Draw' | null;
}

interface BoardProps {
    gameState: GameState;
    onMove: (subBoardIndex: number, cellIndex: number) => void;
    gameMode: 'local' | 'online';
    playerRole: 'X' | 'O' | null;
}

const Board: React.FC<BoardProps> = ({ gameState, onMove, gameMode, playerRole }) => {
    const renderSubBoard = (index: number) => {
        const isActive = gameState.nextSubBoard === null || gameState.nextSubBoard === index;
        return (
            <SubBoard
                key={index}
                index={index}
                currentPlayer={gameState.currentPlayer}
                isActive={isActive}
                onMove={onMove}
                winner={gameState.subBoardWinners[index]}
                cells={gameState.subBoards[index]}
                gameMode={gameMode}
                playerRole={playerRole}
            />
        );
    };

    return (
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto bg-gray-200 p-4 rounded-lg shadow-lg">
            {[...Array(9)].map((_, index) => renderSubBoard(index))}
        </div>
    );
};

export default Board;