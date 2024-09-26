import React, { useState, useEffect } from 'react';

interface SubBoardProps {
    index: number;
    currentPlayer: 'X' | 'O';
    isActive: boolean;
    onMove: (subBoardIndex: number, cellIndex: number, subBoardWinner: 'X' | 'O' | 'Draw' | null) => void;
    winner: 'X' | 'O' | 'Draw' | null;
}

const SubBoard: React.FC<SubBoardProps> = ({ index, currentPlayer, isActive, onMove, winner }) => {
    const [cells, setCells] = useState<Array<'X' | 'O' | null>>(Array(9).fill(null));

    useEffect(() => {
        if (winner) {
            setCells(Array(9).fill(winner));
        }
    }, [winner]);

    const checkWinner = (board: Array<'X' | 'O' | null>): 'X' | 'O' | 'Draw' | null => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        if (board.every((cell) => cell !== null)) {
            return 'Draw';
        }

        return null;
    };

    const handleCellClick = (cellIndex: number) => {
        if (!isActive || winner || cells[cellIndex]) return;

        const newCells = [...cells];
        newCells[cellIndex] = currentPlayer;
        setCells(newCells);

        const subBoardWinner = checkWinner(newCells);
        onMove(index, cellIndex, subBoardWinner);
    };

    const renderCell = (cellIndex: number) => {
        return (
            <button
                key={cellIndex}
                className={`cell w-10 h-10 flex items-center justify-center text-2xl font-bold 
          ${isActive && !winner ? 'bg-white hover:bg-gray-100' : 'bg-gray-200'}
          ${cells[cellIndex] === 'X' ? 'text-blue-500' : 'text-red-500'}
          ${winner ? 'winner-cell' : ''}`}
                onClick={() => handleCellClick(cellIndex)}
                disabled={!isActive || winner !== null}
            >
                {cells[cellIndex]}
            </button>
        );
    };

    return (
        <div className={`sub-board p-2 ${isActive && !winner ? 'bg-yellow-200' : 'bg-gray-300'}`}>
            {winner ? (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold winner-cell">
                    {winner === 'Draw' ? 'D' : winner}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, cellIndex) => renderCell(cellIndex))}
                </div>
            )}
        </div>
    );
};

export default SubBoard;