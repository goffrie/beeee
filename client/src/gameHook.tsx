import React, { useState, useEffect, useContext } from 'react';
import { delay } from './utils';
import { RoomState } from './gameState';
import {callCommit, callList} from './gameAPI';

export type StrawberryGame = Readonly<{
    roomName: string,
    gameState: RoomState,
    stateVersion: number,
    setGameState: (newState: RoomState, abortSignal: AbortSignal) => void,
}>;

export const RoomContext = React.createContext<StrawberryGame | null>(null);
export const UsernameContext = React.createContext<{username: string, setUsername: (_: string) => void} | null>(null);

function RealStrawberryGameProvider({ roomName, children }: { roomName: string, children: React.ReactNode }) {
    const game = useListStrawberryGame(roomName);
    return <RoomContext.Provider value={game}>
        {children}
    </RoomContext.Provider>;
}

function FakeStrawberryGameProvider({ roomName, children }: { roomName: string, children: React.ReactNode }) {
    const game = useFakeStrawberryGame(roomName);
    return <RoomContext.Provider value={game}>
        {children}
    </RoomContext.Provider>;
}

function DevStrawberryGameProvider({ roomName, children }: { roomName: string, children: React.ReactNode }) {
    const Provider = roomName === 'test' ? FakeStrawberryGameProvider : RealStrawberryGameProvider;
    return <Provider roomName={roomName} children={children} />;
}

export const StrawberryGameProvider = process.env.NODE_ENV === 'development' ? DevStrawberryGameProvider : RealStrawberryGameProvider;

async function listLoop(roomName: string, version: number, signal: AbortSignal): Promise<StrawberryGame | null> {
    let backoff = 1000;
    while (true) {
        try {
            const result = await callList(roomName, version, signal);
            backoff = 1000;
            if (result == null) {
                // TODO: potentially add error state
                return null;
            } else if ('timeout' in result) {
                continue;
            } else {
                return {
                    roomName,
                    gameState: result.data,
                    stateVersion: result.version,
                    setGameState: (newState, abortSignal) => {
                        callCommit(roomName, result.version, newState, abortSignal)
                            .then((response) => {
                                if (!response.success) {
                                    console.log("commit failed; race condition occurred");
                                }
                            })
                            .catch((reason) => {
                                if (!abortSignal.aborted) {
                                    console.error(reason);
                                }
                            });
                    },
                };
            }
        } catch (e) {
            if (signal.aborted) return null;
            console.error(e);
            // back off and retry
            console.log(`Backing off for ${backoff} ms`);
            await delay(backoff);
            backoff *= (Math.random() + 0.5);
            backoff = Math.min(backoff, 30000);
            continue;
        }
    }
}

function useListStrawberryGame(roomName: string): StrawberryGame | null {
    const [state, setState] = useState<StrawberryGame | null>(null);
    const version = state?.stateVersion || 0;
    useEffect(() => {
        const abortController = new AbortController();
        listLoop(roomName, version, abortController.signal).then(setState);
        return () => abortController.abort();
    }, [roomName, version]);
    return state;
}

function useFakeStrawberryGame(roomName: string): StrawberryGame | null {
    const [state, setState] = useState<StrawberryGame | null>(null);
    useEffect(() => {
        const makeSetGameState = (version: number) => (newState: RoomState, _: object) => {
            setState({
                roomName,
                gameState: newState,
                stateVersion: version + 1,
                setGameState: makeSetGameState(version + 1),
            })
        };
        setState({
            roomName,
            gameState: { buzzed: null },
            stateVersion: 1,
            setGameState: makeSetGameState(1),
        });
    }, [roomName]);
    return state;
}

// Gain access to the StrawberryGame from context.
export function useStrawberryGame(): StrawberryGame | null {
    return useContext(RoomContext);
}