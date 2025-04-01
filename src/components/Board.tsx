import React from "react";
import SubBoard from "./SubBoard";

interface GameState {
  currentPlayer: "X" | "O";
  nextSubBoard: number | null;
  subBoardWinners: Array<"X" | "O" | "Draw" | null>;
  subBoards: Array<Array<"X" | "O" | null>>;
  winner: "X" | "O" | "Draw" | null;
}

interface BoardProps {
  gameState: GameState;
  onMove: (subBoardIndex: number, cellIndex: number) => void;
  gameMode: "local" | "online";
  playerRole: "X" | "O" | null;
}

const Board: React.FC<BoardProps> = ({
  gameState,
  onMove,
  gameMode,
  playerRole,
}) => {
  const renderSubBoard = (index: number) => {
    const isActive =
      gameState.nextSubBoard === null || gameState.nextSubBoard === index;
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

  const playerColor = playerRole === "X" ? "blue" : "red";

  return (
    <div
      className={`aspect-square w-full max-w-3xl mx-auto p-6 rounded-lg shadow-glass shadow-glow-${playerColor}`}
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-4 h-full">
        {[...Array(9)].map((_, index) => renderSubBoard(index))}
      </div>
    </div>
  );
};

export default Board;
