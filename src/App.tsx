import React, { useState, useCallback, useEffect } from 'react';
import Board from './components/Board';
import PeerConnection from './components/PeerConnection';
import { DataConnection } from 'peerjs';
import qs from 'qs';
import { GameState } from './types/GameState';

type PlayerRole = 'X' | 'O';

interface GameStateData {
  type: 'gameState';
  state: GameState;
}

interface NicknameData {
  type: 'updateNickname';
  role: PlayerRole;
  nickName: string;
}

type DataMessage = GameStateData | NicknameData;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 'X',
    nextSubBoard: null,
    subBoardWinners: Array(9).fill(null),
    subBoards: Array(9).fill(null).map(() => Array(9).fill(null)),
    winner: null,
    players: {
      X: { peerId: null, nickName: null },
      O: { peerId: null, nickName: null },
    },
  });
  const [gameMode, setGameMode] = useState<'local' | 'online' | null>(null);
  const [playerRole, setPlayerRole] = useState<PlayerRole | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nickName, setNickName] = useState<string>('Unknown Player');
  const [peerId, setPeerId] = useState<string | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      setGameState(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [gameState]);

  const sendGameState = useCallback(() => {
    if (gameMode === 'online' && connection && playerRole) {
      const stateToSend: GameState = {
        ...gameState,
        players: {
          ...gameState.players,
          [playerRole]: {
            ...gameState.players[playerRole],
            nickName: nickName
          }
        }
      };
      connection.send({ type: 'gameState', state: stateToSend });
    }
  }, [gameMode, gameState, connection, playerRole, nickName]);

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

  const handleMove = (subBoardIndex: number, cellIndex: number) => {
    setGameState((prevState) => {
      if (prevState.winner) return prevState;
      if (prevState.nextSubBoard !== null && prevState.nextSubBoard !== subBoardIndex) return prevState;
      if (gameMode === 'online' && prevState.currentPlayer !== playerRole) return prevState;
      if (prevState.subBoards[subBoardIndex][cellIndex] !== null) return prevState;

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
        currentPlayer: prevState.currentPlayer === 'X' ? 'O' : 'X',
        nextSubBoard: newSubBoardWinners[cellIndex] !== null ? null : cellIndex,
        subBoardWinners: newSubBoardWinners,
        subBoards: newSubBoards,
        winner: checkWinner(newSubBoardWinners),
        players: prevState.players,
      };

      if (gameMode === 'online' && connection) {
        connection.send({ type: 'gameState', state: newState });
      }

      return newState;
    });
  };

  const resetGame = useCallback(() => {
    const newState: GameState = {
      currentPlayer: 'X',
      nextSubBoard: null,
      subBoardWinners: Array(9).fill(null),
      subBoards: Array(9).fill(null).map(() => Array(9).fill(null)),
      winner: null,
      players: {
        X: { peerId: null, nickName: null },
        O: { peerId: null, nickName: null },
      },
    };
    setGameState(newState);
    if (gameMode === 'online' && connection) {
      connection.send({ type: 'gameState', state: newState });
    }
  }, [connection, gameMode]);

  const updateNickname = useCallback(() => {
    if (gameMode === 'local') {
      setGameState((prevState) => ({
        ...prevState,
        players: {
          X: { ...prevState.players.X, nickName },
          O: { ...prevState.players.O, nickName: `${nickName}'s Opponent` },
        },
      }));
    } else if (gameMode === 'online' && playerRole && connection) {
      setGameState((prevState) => ({
        ...prevState,
        players: {
          ...prevState.players,
          [playerRole]: {
            ...prevState.players[playerRole],
            nickName: nickName
          }
        }
      }));
      // Send nickname update to opponent
      connection.send({ type: 'updateNickname', role: playerRole, nickName });
    }
    sendGameState();
  }, [gameMode, playerRole, connection, nickName, sendGameState]);

  const handleConnectionEstablished = useCallback((conn: DataConnection, initiator: boolean) => {
    setConnection(conn);
    setGameMode('online');
    const role: PlayerRole = initiator ? 'X' : 'O';
    const opponentRole: PlayerRole = role === 'X' ? 'O' : 'X';
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
      }
    }));
    // Update nickname after connection is established
    updateNickname();
  }, [updateNickname]);

  const handleDataReceived = useCallback((data: DataMessage) => {
    if (data.type === 'gameState') {
      setGameState(data.state);
    } else if (data.type === 'updateNickname') {
      setGameState((prevState) => ({
        ...prevState,
        players: {
          ...prevState.players,
          [data.role]: {
            ...prevState.players[data.role],
            nickName: data.nickName
          }
        }
      }));
    }
  }, []);

  const handleConnectionError = useCallback((err: Error) => {
    setError(`Connection error: ${err.message}`);
  }, []);

  const startLocalGame = () => {
    setGameMode('local');
    setPlayerRole(null);
    resetGame();
  };

  const startOnlineGame = useCallback(() => {
    setGameMode('online');
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (window.location.search && qs.parse(window.location.search, { ignoreQueryPrefix: true }).remotePeerId) {
      const queryPeerId = qs.parse(window.location.search, { ignoreQueryPrefix: true }).remotePeerId;
      if (queryPeerId && typeof queryPeerId === 'string') {
        startOnlineGame();
      }
    }
  }, [startOnlineGame]);

  const generateInvitationLink = useCallback(() => {
    if (peerId) {
      return `${window.location.origin}${window.location.pathname}?remotePeerId=${peerId}`;
    }
    return '';
  }, [peerId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full">
        <div>
          <h1 className="text-5xl font-bold mb-6 text-center text-blue-600">Super Tic Tac Toe</h1>
          <div className="flex justify-center mb-4">
            <input
              type="text"
              placeholder="Enter a nickname"
              className="px-4 py-2 border rounded-l-lg"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  updateNickname();
                }
              }}
            />
            <button
              onClick={updateNickname}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Update
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {gameMode === null ? (
          <div className="text-center">
            <button
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300 mr-4"
              onClick={startLocalGame}
            >
              Play Locally
            </button>
            <button
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-300"
              onClick={startOnlineGame}
            >
              Play Online
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              {gameState.winner ? (
                <div className="text-3xl font-semibold text-center">
                  {gameState.winner === 'Draw' ? "It's a draw!" : `${gameState.winner} wins!`}
                </div>
              ) : (
                <div className="text-2xl font-semibold text-center">
                  Current player: <span className={gameState.currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500'}>
                    {gameState.players[gameState.currentPlayer].nickName || gameState.currentPlayer}
                  </span>
                </div>
              )}
              {!gameState.winner && (
                <div className="text-lg text-center mt-2">
                  {gameState.nextSubBoard === null
                    ? "Next move: Any available sub-board"
                    : `Next move: Sub-board ${gameState.nextSubBoard + 1}`}
                </div>
              )}
              {gameMode === 'online' && playerRole && (
                <div className="text-lg text-center mt-2">
                  You are playing as: <span className={playerRole === 'X' ? 'text-blue-500' : 'text-red-500'}>
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
              <div className="text-center mt-6">
                <button
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300"
                  onClick={resetGame}
                >
                  Play Again
                </button>
              </div>
            )}
          </>
        )}
        {gameMode === 'online' && (
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
