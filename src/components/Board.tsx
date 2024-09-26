import React from 'react';
import SubBoard from './SubBoard';

interface BoardProps {
    currentPlayer: 'X' | 'O';
    nextSubBoard: number | null;
    onMove: (subBoardIndex: number, cellIndex: number, subBoardWinner: 'X' | 'O' | 'Draw' | null) => void;
    subBoardWinners: Array<'X' | 'O' | 'Draw' | null>;
}

const Board: React.FC<BoardProps> = ({ currentPlayer, nextSubBoard, onMove, subBoardWinners }) => {
    const renderSubBoard = (index: number) => {
        const isActive = nextSubBoard === null || nextSubBoard === index;
        return (
            <SubBoard
                key={index}
                index={index}
                currentPlayer={currentPlayer}
                isActive={isActive}
                onMove={onMove}
                winner={subBoardWinners[index]}
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