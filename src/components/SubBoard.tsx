import React from 'react';

interface SubBoardProps {
    index: number;
    currentPlayer: 'X' | 'O';
    isActive: boolean;
    onMove: (subBoardIndex: number, cellIndex: number) => void;
    winner: 'X' | 'O' | 'Draw' | null;
    cells: Array<'X' | 'O' | null>;
    gameMode: 'local' | 'online';
    playerRole: 'X' | 'O' | null;
}

const SubBoard: React.FC<SubBoardProps> = ({
    index,
    currentPlayer,
    isActive,
    onMove,
    winner,
    cells,
    gameMode,
    playerRole
}) => {
    const handleCellClick = (cellIndex: number) => {
        if (!isActive || winner || cells[cellIndex]) return;
        if (gameMode === 'online' && currentPlayer !== playerRole) return;
        onMove(index, cellIndex);
    };

    const renderCell = (cellIndex: number) => {
        return (
            <button
                key={cellIndex}
                className={`cell w-10 h-10 flex items-center justify-center text-2xl font-bold 
          ${isActive && !winner ? 'bg-white hover:bg-gray-100' : 'bg-gray-200'}
          ${cells[cellIndex] === 'X' ? 'text-blue-500' : cells[cellIndex] === 'O' ? 'text-red-500' : ''}
          ${winner ? 'winner-cell' : ''}`}
                onClick={() => handleCellClick(cellIndex)}
                disabled={!isActive || winner !== null || (gameMode === 'online' && currentPlayer !== playerRole)}
            >
                {cells[cellIndex]}
            </button>
        );
    };

    const isPlayerTurn = gameMode === 'local' || (gameMode === 'online' && currentPlayer === playerRole);

    return (
        <div className={`sub-board p-2 ${isActive && !winner ? (isPlayerTurn ? 'bg-green-200' : 'bg-red-200') : 'bg-gray-300'}`}>
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