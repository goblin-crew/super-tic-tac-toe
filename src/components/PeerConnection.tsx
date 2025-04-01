import React, { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import qs from 'qs';
import { GameState } from '../types/GameState';

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

interface PeerConnectionProps {
    onConnection: (conn: DataConnection, initiator: boolean) => void;
    onData: (data: DataMessage) => void;
    onError: (error: Error) => void;
    gameState: GameState;
    generateInvitationLink: () => string;
    setPeerId: React.Dispatch<React.SetStateAction<string | null>>;
}

const PeerConnection: React.FC<PeerConnectionProps> = ({
    onConnection,
    onData,
    onError,
    gameState,
    generateInvitationLink,
    setPeerId
}) => {
    const [peer, setPeer] = useState<Peer | null>(null);
    const [connection, setConnection] = useState<DataConnection | null>(null);
    const [remotePeerId, setRemotePeerId] = useState<string>('');
    const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
    const [linkCopied, setLinkCopied] = useState<boolean>(false);

    const handleIncomingConnection = useCallback((conn: DataConnection) => {
        setConnection(conn);
        setConnectionStatus('Incoming connection');
        conn.on('open', () => {
            onConnection(conn, false);
            setRemotePeerId(conn.peer);
            setConnectionStatus('Connected');
            conn.on('data', (data: unknown) => {
                onData(data as DataMessage);
            });
            conn.on('error', (err) => {
                onError(err);
                setConnectionStatus(`Connection error: ${err.message}`);
            });
        });
    }, [onConnection, onData, onError]);

    const connectToPeer = useCallback((targetPeerId: string, peerInstance: Peer | null = peer) => {
        if (peerInstance && targetPeerId) {
            try {
                const conn = peerInstance.connect(targetPeerId);
                setConnection(conn);
                setConnectionStatus('Connecting...');
                conn.on('open', () => {
                    onConnection(conn, true);
                    setConnectionStatus('Connected');
                    conn.on('data', (data: unknown) => {
                        onData(data as DataMessage);
                    });
                    conn.on('error', (err) => {
                        onError(err);
                        setConnectionStatus(`Connection error: ${err.message}`);
                    });
                });
            } catch (err) {
                onError(err instanceof Error ? err : new Error('Failed to connect to peer'));
                setConnectionStatus('Connection failed');
            }
        }
    }, [peer, onConnection, onData, onError]);

    const peerRef = useRef<Peer | null>(null);

    useEffect(() => {
        const peerOptions = {
            debug: 3
        };

        const newPeer = new Peer(peerOptions);
        setPeer(newPeer);
        peerRef.current = newPeer;

        newPeer.on('open', (id) => {
            setPeerId(id);
            setConnectionStatus('Waiting for connection');

            // Check if there's a remotePeerId in the URL
            const queryParams = qs.parse(window.location.search, { ignoreQueryPrefix: true });
            if (queryParams.remotePeerId && typeof queryParams.remotePeerId === 'string') {
                setRemotePeerId(queryParams.remotePeerId);
                connectToPeer(queryParams.remotePeerId, newPeer);
            }
        });

        newPeer.on('error', (err) => {
            onError(err);
            setConnectionStatus(`Error: ${err.message}`);
        });

        newPeer.on('connection', handleIncomingConnection);

        return () => {
            if (peerRef.current) {
                peerRef.current.destroy();
            }
        };
    }, []);

    const copyInviteLink = useCallback(() => {
        const inviteLink = generateInvitationLink();
        navigator.clipboard.writeText(inviteLink);
        setLinkCopied(true);
        setConnectionStatus('Invite link copied. Waiting for peer...');
        setTimeout(() => setLinkCopied(false), 3000);
    }, [generateInvitationLink]);

    const getOpponentNickname = () => {
        if (connection) {
            const opponent = Object.entries(gameState.players).find(([_, player]) => player.peerId === connection.peer);
            return opponent ? opponent[1].nickName || 'Unnamed opponent' : 'Unknown opponent';
        }
        return 'Not connected';
    };

    return (
        <div className="peer-connection mt-4">
            <div className="flex justify-center items-center mb-4">
                <p className="text-center mr-2">Your Peer ID: <span className="font-bold">{peer?.id}</span></p>
                <button
                    onClick={copyInviteLink}
                    className={`px-4 py-2 ${linkCopied ? 'bg-blue-500' : 'bg-green-500'} text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors duration-300`}
                >
                    {linkCopied ? 'Copied!' : 'Copy Invite Link'}
                </button>
            </div>
            <p className="text-center mb-4">Status: <span className="font-bold">{connectionStatus}</span></p>
            {!connection && (
                <div className="flex justify-center mt-4">
                    <input
                        type="text"
                        placeholder="Enter peer ID to connect"
                        className="px-4 py-2 border rounded-l-lg"
                        value={remotePeerId}
                        onChange={(e) => setRemotePeerId(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                connectToPeer(remotePeerId);
                            }
                        }}
                    />
                    <button
                        onClick={() => connectToPeer(remotePeerId)}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    >
                        Connect
                    </button>
                </div>
            )}
            {connection && (
                <p className="text-center text-green-500 font-semibold">
                    Connected to: {getOpponentNickname()}
                </p>
            )}
        </div>
    );
};

export default PeerConnection;