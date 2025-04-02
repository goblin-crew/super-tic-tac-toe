import React, { useState, useCallback, useEffect } from "react";
import Board from "./components/Board";
import PeerConnection from "./components/PeerConnection";
import { DataConnection } from "peerjs";
import qs from "qs";
import { GameState } from "./types/GameState";

type PlayerRole = "X" | "O";

interface GameStateData {
  type: "gameState";
  state: GameState;
}

interface NicknameData {
  type: "updateNickname";
  role: PlayerRole;
  nickName: string;
}

type DataMessage = GameStateData | NicknameData;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: "X",
    nextSubBoard: null,
    subBoardWinners: Array(9).fill(null),
    subBoards: Array(9)
      .fill(null)
      .map(() => Array(9).fill(null)),
    winner: null,
    players: {
      X: { peerId: null, nickName: null },
      O: { peerId: null, nickName: null },
    },
  });
  const [gameMode, setGameMode] = useState<"local" | "online" | null>(null);
  const [playerRole, setPlayerRole] = useState<PlayerRole | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nickName, setNickName] = useState<string>("Unknown Player");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [playerOName, setPlayerOName] = useState<string>("Opponent");
  const [editingName, setEditingName] = useState<PlayerRole | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
      setGameState(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("gameState", JSON.stringify(gameState));
  }, [gameState]);

  const sendGameState = useCallback(() => {
    if (gameMode === "online" && connection && playerRole) {
      const stateToSend: GameState = {
        ...gameState,
        players: {
          ...gameState.players,
          [playerRole]: {
            ...gameState.players[playerRole],
            nickName: nickName,
          },
        },
      };
      connection.send({ type: "gameState", state: stateToSend });
    }
  }, [gameMode, gameState, connection, playerRole, nickName]);

  const checkWinner = (
    board: Array<"X" | "O" | "Draw" | null>
  ): "X" | "O" | "Draw" | null => {
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
      if (
        board[a] &&
        board[a] === board[b] &&
        board[a] === board[c] &&
        board[a] !== "Draw"
      ) {
        return board[a];
      }
    }

    if (board.every((subBoard) => subBoard !== null)) {
      return "Draw";
    }

    return null;
  };

  const handleMove = (subBoardIndex: number, cellIndex: number) => {
    setGameState((prevState) => {
      if (prevState.winner) return prevState;
      if (
        prevState.nextSubBoard !== null &&
        prevState.nextSubBoard !== subBoardIndex
      )
        return prevState;
      if (gameMode === "online" && prevState.currentPlayer !== playerRole)
        return prevState;
      if (prevState.subBoards[subBoardIndex][cellIndex] !== null)
        return prevState;

      const newSubBoards = prevState.subBoards.map((subBoard, index) =>
        index === subBoardIndex ? [...subBoard] : subBoard
      );
      newSubBoards[subBoardIndex][cellIndex] = prevState.currentPlayer;

      const newSubBoardWinners = [...prevState.subBoardWinners];
      const subBoardWinner = checkWinner(newSubBoards[subBoardIndex]);
      if (subBoardWinner) {
        newSubBoardWinners[subBoardIndex] = subBoardWinner;
      }

      const newState: GameState = {
        currentPlayer: prevState.currentPlayer === "X" ? "O" : "X",
        nextSubBoard: newSubBoardWinners[cellIndex] !== null ? null : cellIndex,
        subBoardWinners: newSubBoardWinners,
        subBoards: newSubBoards,
        winner: checkWinner(newSubBoardWinners),
        players: prevState.players,
      };

      if (gameMode === "online" && connection) {
        connection.send({ type: "gameState", state: newState });
      }

      return newState;
    });
  };

  const resetGame = useCallback(() => {
    const newState: GameState = {
      currentPlayer: "X",
      nextSubBoard: null,
      subBoardWinners: Array(9).fill(null),
      subBoards: Array(9)
        .fill(null)
        .map(() => Array(9).fill(null)),
      winner: null,
      players: {
        X: { peerId: null, nickName: null },
        O: { peerId: null, nickName: null },
      },
    };
    setGameState(newState);
    if (gameMode === "online" && connection) {
      connection.send({ type: "gameState", state: newState });
    }
  }, [connection, gameMode]);

  const updateNickname = useCallback(
    (role?: PlayerRole) => {
      if (gameMode === "local") {
        setGameState((prevState) => ({
          ...prevState,
          players: {
            X: { ...prevState.players.X, nickName: nickName },
            O: { ...prevState.players.O, nickName: playerOName },
          },
        }));
      } else if (gameMode === "online" && playerRole && connection) {
        setGameState((prevState) => ({
          ...prevState,
          players: {
            ...prevState.players,
            [playerRole]: {
              ...prevState.players[playerRole],
              nickName: nickName,
            },
          },
        }));
        // Send nickname update to opponent
        connection.send({ type: "updateNickname", role: playerRole, nickName });
      }
      sendGameState();
      // Clear editing state after updating
      setEditingName(null);
    },
    [gameMode, playerRole, connection, nickName, playerOName, sendGameState]
  );

  const handleConnectionEstablished = useCallback(
    (conn: DataConnection, initiator: boolean) => {
      setConnection(conn);
      setGameMode("online");
      const role: PlayerRole = initiator ? "X" : "O";
      const opponentRole: PlayerRole = role === "X" ? "O" : "X";
      setPlayerRole(role);
      setGameState((prevState) => ({
        ...prevState,
        players: {
          ...prevState.players,
          [role]: {
            peerId: conn.provider.id,
            nickName: null, // Set to null initially
          },
          [opponentRole]: {
            ...prevState.players[opponentRole],
            peerId: conn.peer,
          },
        },
      }));
      // Update nickname after connection is established
      updateNickname();
    },
    [updateNickname]
  );

  const handleDataReceived = useCallback((data: DataMessage) => {
    if (data.type === "gameState") {
      setGameState(data.state);
    } else if (data.type === "updateNickname") {
      setGameState((prevState) => ({
        ...prevState,
        players: {
          ...prevState.players,
          [data.role]: {
            ...prevState.players[data.role],
            nickName: data.nickName,
          },
        },
      }));
    }
  }, []);

  const handleConnectionError = useCallback((err: Error) => {
    setError(`Connection error: ${err.message}`);
  }, []);

  const startLocalGame = () => {
    setGameMode("local");
    setPlayerRole(null);
    resetGame();
  };

  const startOnlineGame = useCallback(() => {
    setGameMode("online");
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (
      window.location.search &&
      qs.parse(window.location.search, { ignoreQueryPrefix: true }).remotePeerId
    ) {
      const queryPeerId = qs.parse(window.location.search, {
        ignoreQueryPrefix: true,
      }).remotePeerId;
      if (queryPeerId && typeof queryPeerId === "string") {
        startOnlineGame();
      }
    }
  }, [startOnlineGame]);

  const generateInvitationLink = useCallback(() => {
    if (peerId) {
      return `${window.location.origin}${window.location.pathname}?remotePeerId=${peerId}`;
    }
    return "";
  }, [peerId]);

  const goBackToSelection = () => {
    setGameMode(null);
    setPlayerRole(null);
    setError(null);
  };

  // Player name display/edit component
  const PlayerNameDisplay = ({
    role,
    currentEdit,
  }: {
    role: PlayerRole;
    currentEdit: PlayerRole | null;
  }) => {
    const isEditing = editingName === role;
    const canEdit =
      gameMode === "local" || (gameMode === "online" && playerRole === role);
    const displayName = gameState.players[role].nickName || `Player ${role}`;
    const inputValue =
      role === "X" ? nickName : gameMode === "local" ? playerOName : nickName;

    const handleNameClick = () => {
      if (canEdit) {
        setEditingName(role);
        if (role === "X") {
          setNickName(displayName === `Player ${role}` ? "" : displayName);
        } else if (gameMode === "local") {
          setPlayerOName(displayName === `Player ${role}` ? "" : displayName);
        } else {
          setNickName(displayName === `Player ${role}` ? "" : displayName);
        }
      }
    };

    return (
      <div
        className={`px-3 py-1 rounded-lg glass ${
          gameState.currentPlayer === role
            ? `current-player-${role.toLowerCase()} animate-pulse-subtle`
            : ""
        }`}
      >
        <span
          className={`${
            role === "X" ? "text-blue-400" : "text-red-400"
          } font-bold mr-1`}
        >
          {role}
        </span>

        {isEditing ? (
          <div className="inline-flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) =>
                role === "X"
                  ? setNickName(e.target.value)
                  : gameMode === "local"
                  ? setPlayerOName(e.target.value)
                  : setNickName(e.target.value)
              }
              className="glass-input text-sm w-24 px-1"
              placeholder={`Player ${role}`}
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && updateNickname(role)}
            />
            <button
              onClick={() => updateNickname(role)}
              className="ml-1 text-gray-400 hover:text-white"
              title="Confirm"
            >
              ✓
            </button>
          </div>
        ) : (
          <span
            className={`text-sm ${
              canEdit ? "cursor-pointer hover:underline" : ""
            }`}
            onClick={handleNameClick}
          >
            {displayName}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <div className="glass rounded-xl p-4 max-w-4xl w-full">
        <div className="flex justify-start items-center mb-3">
          {gameMode !== null && (
            <button
              onClick={goBackToSelection}
              className="glass-button-secondary px-3 py-1 text-white font-semibold rounded-lg text-sm"
            >
              ← Back
            </button>
          )}
          <h1 className="text-3xl font-bold text-blue-400">
            Super Tic Tac Toe
          </h1>
        </div>
        {error && (
          <div
            className="glass-dark border border-red-400 text-red-300 px-3 py-2 rounded relative mb-2 text-sm"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {gameMode === null ? (
          <div className="text-center mb-2">
            <button
              className="glass-button px-4 py-2 text-white font-semibold rounded-lg mr-4 text-sm"
              onClick={startLocalGame}
            >
              Play Locally
            </button>
            <button
              className="glass-button-green px-4 py-2 text-white font-semibold rounded-lg text-sm"
              onClick={startOnlineGame}
            >
              Play Online
            </button>
          </div>
        ) : (
          <>
            <div className="mb-2">
              {gameState.winner ? (
                <div className="text-2xl font-semibold text-center">
                  {gameState.winner === "Draw"
                    ? "It's a draw!"
                    : `${gameState.winner} wins!`}
                </div>
              ) : (
                <div className="flex justify-center items-center space-x-4 my-2">
                  <PlayerNameDisplay role="X" currentEdit={editingName} />

                  <div className="text-sm font-bold">VS</div>

                  <PlayerNameDisplay role="O" currentEdit={editingName} />
                </div>
              )}
              {gameMode === "online" && playerRole && (
                <div className="text-sm text-center">
                  You are playing as:{" "}
                  <span
                    className={
                      playerRole === "X" ? "text-blue-500" : "text-red-500"
                    }
                  >
                    {gameState.players[playerRole].nickName || playerRole}
                  </span>
                </div>
              )}
            </div>
            <Board
              gameState={gameState}
              onMove={handleMove}
              gameMode={gameMode}
              playerRole={playerRole}
            />
            {gameState.winner && (
              <div className="text-center mt-3">
                <button
                  className="glass-button px-4 py-2 text-white font-semibold rounded-lg text-sm"
                  onClick={resetGame}
                >
                  Play Again
                </button>
              </div>
            )}
          </>
        )}
        {gameMode === "online" && (
          <PeerConnection
            onConnection={handleConnectionEstablished}
            onData={handleDataReceived}
            onError={handleConnectionError}
            gameState={gameState}
            generateInvitationLink={generateInvitationLink}
            setPeerId={setPeerId}
          />
        )}
      </div>
    </div>
  );
};

export default App;
