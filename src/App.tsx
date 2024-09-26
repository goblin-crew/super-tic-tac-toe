import React, { useState } from 'react';
import Board from './components/Board';

const App: React.FC = () => {
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [nextSubBoard, setNextSubBoard] = useState<number | null>(null);
  const [winner, setWinner] = useState<'X' | 'O' | 'Draw' | null>(null);
  const [subBoardWinners, setSubBoardWinners] = useState<Array<'X' | 'O' | 'Draw' | null>>(Array(9).fill(null));

  const checkWinner = (board: Array<'X' | 'O' | 'Draw' | null>): 'X' | 'O' | 'Draw' | null => {
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
      if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] !== 'Draw') {
        return board[a];
      }
    }

    if (board.every((subBoard) => subBoard !== null)) {
      return 'Draw';
    }

    return null;
  };

  const handleMove = (subBoardIndex: number, cellIndex: number, subBoardWinner: 'X' | 'O' | 'Draw' | null) => {
    if (winner) return;

    if (nextSubBoard !== null && nextSubBoard !== subBoardIndex) return;

    const newSubBoardWinners = [...subBoardWinners];
    if (subBoardWinner) {
      newSubBoardWinners[subBoardIndex] = subBoardWinner;
      setSubBoardWinners(newSubBoardWinners);

      // Check for winner of the entire game
      const gameWinner = checkWinner(newSubBoardWinners);
      if (gameWinner) {
        setWinner(gameWinner);
        return;
      }
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');

    // Determine the next sub-board
    if (newSubBoardWinners[cellIndex] !== null) {
      // If the next sub-board is already won, allow the next player to play anywhere
      setNextSubBoard(null);
    } else {
      setNextSubBoard(cellIndex);
    }
  };

  const resetGame = () => {
    setCurrentPlayer('X');
    setNextSubBoard(null);
    setWinner(null);
    setSubBoardWinners(Array(9).fill(null));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full">
        <h1 className="text-5xl font-bold mb-6 text-center text-blue-600">Super Tic Tac Toe</h1>
        <div className="mb-6">
          {winner ? (
            <div className="text-3xl font-semibold text-center">
              {winner === 'Draw' ? "It's a draw!" : `${winner} wins!`}
            </div>
          ) : (
            <div className="text-2xl font-semibold text-center">
              Current player: <span className={currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500'}>{currentPlayer}</span>
            </div>
          )}
          {!winner && (
            <div className="text-lg text-center mt-2">
              {nextSubBoard === null
                ? "Next move: Any available sub-board"
                : `Next move: Sub-board ${nextSubBoard + 1}`}
            </div>
          )}
        </div>
        <Board
          currentPlayer={currentPlayer}
          nextSubBoard={nextSubBoard}
          onMove={handleMove}
          subBoardWinners={subBoardWinners}
        />
        {winner && (
          <div className="text-center mt-6">
            <button
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
