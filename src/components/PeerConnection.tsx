import React, { useState, useEffect, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import qs from 'qs';

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
        if (qs.parse(window.location.search, { ignoreQueryPrefix: true }).remotePeerId) {
            const queryPeerId = qs.parse(window.location.search, { ignoreQueryPrefix: true }).remotePeerId;
            if (queryPeerId && typeof queryPeerId === 'string') {
                setRemotePeerId(queryPeerId);
            }
        }
    }, [])

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
                setRemotePeerId(conn.peer);
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

    // useEffect(() => {
    //     // Check if connection is valid
    //     if (connection && connection.open) {
    //         setConnectionValid(true);
    //     } else {
    //         setConnectionValid(false);
    //     }
    // }, [connection]);

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

    const remotePeerIdIsValid = (id: string): boolean => {
        return /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(id);
    };

    useEffect(() => {
        if (peerId && peer && remotePeerId && remotePeerIdIsValid(remotePeerId)) {
            connectToPeer();
        }
    }, [remotePeerId, connectToPeer, peer, peerId]);

    const copyInviteLink = useCallback(() => {
        navigator.clipboard.writeText(`${window.location.origin}?remotePeerId=${peerId}`);
    }, [peerId]);

    return (
        <div className="peer-connection mt-4">
            <div className="flex justify-center">
                <p className="text-center mb-2">Your Peer ID: <span className="font-bold">{peerId}</span></p>
                <div className='cursor-pointer' onClick={() => {
                    copyInviteLink()
                }
                }>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                </div>
            </div>
            {connection ? (
                <p className="text-center text-green-500 font-semibold">Connected to peer ({remotePeerId})</p>
            ) : (
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
            )
            }
        </div>
    );
};

export default PeerConnection;