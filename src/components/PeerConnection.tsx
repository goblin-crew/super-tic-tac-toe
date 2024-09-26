import React, { useState, useEffect, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

interface PeerConnectionProps {
    onConnection: (conn: DataConnection, initiator: boolean) => void;
    onData: (data: any) => void;
    onError: (error: Error) => void;
}

const PeerConnection: React.FC<PeerConnectionProps> = ({ onConnection, onData, onError }) => {
    const [peerId, setPeerId] = useState<string>('');
    const [peer, setPeer] = useState<Peer | null>(null);
    const [connection, setConnection] = useState<DataConnection | null>(null);
    const [remotePeerId, setRemotePeerId] = useState<string>('');

    useEffect(() => {
        const newPeer = new Peer();
        setPeer(newPeer);

        newPeer.on('open', (id) => {
            setPeerId(id);
        });

        newPeer.on('error', (err) => {
            onError(err);
        });

        newPeer.on('connection', (conn) => {
            setConnection(conn);
            conn.on('open', () => {
                onConnection(conn, false);
                conn.on('data', (data) => {
                    onData(data);
                });
                conn.on('error', (err) => {
                    onError(err);
                });
            });
        });

        return () => {
            newPeer.destroy();
        };
    }, [onConnection, onData, onError]);

    const connectToPeer = useCallback(() => {
        if (peer && remotePeerId) {
            try {
                const conn = peer.connect(remotePeerId);
                setConnection(conn);
                conn.on('open', () => {
                    onConnection(conn, true);
                    conn.on('data', (data) => {
                        onData(data);
                    });
                    conn.on('error', (err) => {
                        onError(err);
                    });
                });
            } catch (err) {
                onError(err instanceof Error ? err : new Error('Failed to connect to peer'));
            }
        }
    }, [peer, remotePeerId, onConnection, onData, onError]);

    return (
        <div className="peer-connection mt-4">
            <p className="text-center mb-2">Your Peer ID: <span className="font-bold">{peerId}</span></p>
            {!connection && (
                <div className="flex justify-center">
                    <input
                        type="text"
                        placeholder="Enter peer ID to connect"
                        className="px-4 py-2 border rounded-l-lg"
                        value={remotePeerId}
                        onChange={(e) => setRemotePeerId(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                connectToPeer();
                            }
                        }}
                    />
                    <button
                        onClick={connectToPeer}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r-lg hover:bg-blue-600 transition-colors duration-300"
                    >
                        Connect
                    </button>
                </div>
            )}
            {connection && (
                <p className="text-center text-green-500 font-semibold">Connected to peer</p>
            )}
        </div>
    );
};

export default PeerConnection;