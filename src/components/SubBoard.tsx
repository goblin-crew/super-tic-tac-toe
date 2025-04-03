import React, { useEffect, useRef } from "react";
import { useSound } from "../contexts/SoundContext";

import PlayerIcon from "./PlayerIcon";

interface SubBoardProps {
  index: number;
  currentPlayer: "X" | "O";
  isActive: boolean;
  onMove: (subBoardIndex: number, cellIndex: number) => void;
  winner: "X" | "O" | "Draw" | null;
  cells: Array<"X" | "O" | null>;
  gameMode: "local" | "online";
  playerRole: "X" | "O" | null;
}

const SubBoard: React.FC<SubBoardProps> = ({
  index,
  currentPlayer,
  isActive,
  onMove,
  winner,
  cells,
  gameMode,
  playerRole,
}) => {
  const {
    playMoveSound,
    playHoverSound,
    playSubBoardHoverSound,
    playSubBoardWinSound,
  } = useSound();

  const [isPlayerTurn, setIsPlayerTurn] = React.useState<boolean>(
    gameMode === "local" ||
      (gameMode === "online" && currentPlayer === playerRole)
  );

  const prevWinnerRef = useRef<"X" | "O" | "Draw" | null>(null);

  // Play sound when sub-board is won
  useEffect(() => {
    if (winner && winner !== prevWinnerRef.current) {
      if (winner === "Draw") {
        // No special sound for sub-board draw
      } else {
        playSubBoardWinSound(winner);
      }
      prevWinnerRef.current = winner;
    }
  }, [winner, playSubBoardWinSound]);

  useEffect(() => {
    if (gameMode === "online") {
      setIsPlayerTurn(currentPlayer === playerRole);
    } else {
      setIsPlayerTurn(true);
    }
  }, [currentPlayer, playerRole, gameMode]);

  const handleCellClick = (cellIndex: number) => {
    if (!isActive || winner || cells[cellIndex]) return;
    if (gameMode === "online" && currentPlayer !== playerRole) return;

    // Play move sound
    playMoveSound(currentPlayer);

    onMove(index, cellIndex);
  };

  const handleCellHover = () => {
    if (isActive && !winner && isPlayerTurn) {
      playHoverSound(currentPlayer);
    }
  };

  const handleSubBoardHover = () => {
    if (isActive && !winner && isPlayerTurn) {
      playSubBoardHoverSound(currentPlayer);
    }
  };

  const renderCell = (cellIndex: number) => {
    const isCurrentPlayerX = currentPlayer === "X";
    const cellContent = cells[cellIndex];

    return (
      <button
        key={cellIndex}
        className={`cell aspect-square w-full flex items-center justify-center text-2xl font-bold 
                ${
                  isActive && !winner
                    ? "glass-light hover:bg-glass-200"
                    : "glass"
                }
                ${
                  cellContent === "X"
                    ? "text-blue-400"
                    : cellContent === "O"
                    ? "text-red-400"
                    : ""
                }
                ${winner ? "winner-cell" : ""}
                ${
                  cellContent === "X"
                    ? isActive
                      ? "shadow-glow-blue"
                      : ""
                    : cellContent === "O"
                    ? isActive
                      ? "shadow-glow-red"
                      : ""
                    : ""
                }
                ${
                  isActive && !winner && !cellContent
                    ? isCurrentPlayerX
                      ? "hover:border-blue-400"
                      : "hover:border-red-400"
                    : ""
                }
                ${!isActive && !winner ? "opacity-70" : ""}
                transition-all duration-200`}
        onClick={() => handleCellClick(cellIndex)}
        onMouseEnter={handleCellHover}
        disabled={!isActive || winner !== null || !isPlayerTurn}
      >
        <PlayerIcon player={cellContent} />
      </button>
    );
  };

  const currentPlayerColor = currentPlayer === "X" ? "blue" : "red";

  return (
    <div
      className={`sub-board aspect-square w-full p-2 
            ${
              isActive && !winner
                ? `glass-light border-2 border-${currentPlayerColor}-400 shadow-glow-${currentPlayerColor} ${
                    isPlayerTurn
                      ? "animate-pulse-subtle"
                      : "blur-[0.5px] saturate-[.6] brightness-[.6] transition-all duration-200"
                  }`
                : winner
                ? winner === "X"
                  ? "shadow-glow-blue inset-shadow"
                  : winner === "O"
                  ? "shadow-glow-red inset-shadow"
                  : "shadow-glow-purple"
                : "glass opacity-50"
            }`}
      onMouseEnter={handleSubBoardHover}
    >
      {winner ? (
        <div
          className={`w-full h-full flex items-center justify-center text-4xl font-bold select-none  ${
            winner === "X"
              ? "winner-x text-blue-400"
              : winner === "O"
              ? "winner-o text-red-400"
              : "winner-cell text-purple-400"
          }`}
        >
          <PlayerIcon player={winner} />
        </div>
      ) : (
        <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full">
          {[...Array(9)].map((_, cellIndex) => renderCell(cellIndex))}
        </div>
      )}
    </div>
  );
};

export default SubBoard;
// Compare this snippet from src/components/Board.tsx:
