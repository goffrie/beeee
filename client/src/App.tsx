import { useState, useEffect, useContext, useCallback } from 'react';

import { SuperWrappedLoadingStrawberry } from './LoadingStrawberry';
import { FRUIT, FruitEmojiContext, FRUIT_NAMES } from './Fruit';

import { MainPage } from './MainPage';
import { createNewRoom } from './gameActions';
import { useStrawberryGame, StrawberryGameProvider, UsernameContext } from './gameHook';

import './App.css';
import { useLocalStorage } from './localStorage';
import useSound from 'use-sound';
import beeSfx from './bee.mp3';

const USERNAME_KEY: string = 'username';
const FRUIT_KEY: string = 'fruit';

function App({ initialRoom }: { initialRoom: string }) {
    const [username, setUsername] = useLocalStorage(USERNAME_KEY);
    const [room, setRoom] = useState(initialRoom);
    const [isPendingRoomCreation, setIsPendingRoomCreation] = useState(false);

    const [fruitIndexVar, setFruitIndexVar] = useLocalStorage(FRUIT_KEY);
    let fruitIndex = fruitIndexVar ? parseInt(fruitIndexVar) : 0;
    if (!FRUIT[fruitIndex]) fruitIndex = 0;
    const fruitEmoji = FRUIT[fruitIndex];
    const changeFruit = () => {
        // pick a random index other than `fruitIndex`
        let newIndex = Math.floor(Math.random() * (FRUIT.length - 1));
        if (newIndex >= fruitIndex) newIndex += 1;
        setFruitIndexVar(newIndex.toString());
    };

    const [isNotified, setNotified] = useState(false);

    // Update the window title as needed
    useEffect(() => {
        document.title = (isNotified ? "(!) " : "") + FRUIT_NAMES[fruitIndex];
    }, [isNotified, fruitIndex]);

    useEffect(() => {
        const listener = () => {
            const newRoom = window.location.hash.substr(1);
            if (room !== newRoom) {
                setRoom(newRoom);
            }
        };
        window.addEventListener('hashchange', listener, false);
        return () => {
            window.removeEventListener('hashchange', listener, false);
        };
    });

    let page;
    if (isPendingRoomCreation) {
        page = <SuperWrappedLoadingStrawberry />;
    } else if (username !== null && room !== '') {
        page = <StrawberryGameProvider roomName={room}>
            <UsernameContext.Provider value={{username, setUsername}}>
                <Game setNotified={setNotified} />
            </UsernameContext.Provider>
        </StrawberryGameProvider>;
    } else {
        // TODO: confusingly, this handles both setting a username and creating a game. They should be separate.
        page = <MainPage
            isLoggedIn={username !== null}
            setUsername={setUsername}
            createGame={async () => {
                setIsPendingRoomCreation(true);
                const newRoom = await createNewRoom();
                setRoom(newRoom);
                window.location.hash = `#${newRoom}`;
                setIsPendingRoomCreation(false);
            }}
            changeFruit={changeFruit}
        />;
    }
    return <FruitEmojiContext.Provider value={fruitEmoji}>
        {page}
    </FruitEmojiContext.Provider>;
}

function Game({setNotified}: {setNotified: (_: boolean) => void}) {
    // TODO: bounce if game doesn't exist
    const strawberryGame = useStrawberryGame();
    const { username } = useContext(UsernameContext)!;
    const fruitEmoji = useContext(FruitEmojiContext)!;
    const [buzzVersion, setBuzzVersion] = useState(-1);
    const [play] = useSound(beeSfx);

    useEffect(() => {
        if (strawberryGame?.gameState.buzzed) {
            console.log(`buzzed: ${strawberryGame?.gameState.buzzed}`);
            play();
        }
        setNotified(strawberryGame?.gameState.buzzed != null);
    }, [strawberryGame?.gameState.buzzed, play]);

    const go = useCallback((buzzed: string | null) => {
        if (strawberryGame != null && (buzzed == null) !== (strawberryGame.gameState.buzzed == null)) {
            setBuzzVersion(strawberryGame.stateVersion);
            const abortController = new AbortController();
            strawberryGame.setGameState({buzzed}, abortController.signal);
        }
    }, [strawberryGame]);
    const buzz = useCallback(() => go(username), [go, username]);
    const unbuzz = useCallback(() => go(null), [go]);

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === 'Backspace') {
                unbuzz();
            } else {
                buzz();
            }
        };
        window.addEventListener('keydown', listener, false);
        return () => {
            window.removeEventListener('keydown', listener, false);
        };
    }, [unbuzz, buzz]);

    // Game state is null if game doesnt exist or still loading.
    if (strawberryGame === null) {
        return <SuperWrappedLoadingStrawberry />;
    }

    const disabled = (buzzVersion === strawberryGame.stateVersion);

    return <div className='gameContainer'>
        <div className='buzzer' id='buzzer'>{strawberryGame.gameState.buzzed != null && strawberryGame.gameState.buzzed}</div>
        <button className='strawberryButton' id='buzz' onClick={buzz} disabled={disabled || strawberryGame.gameState.buzzed != null}>{fruitEmoji}</button>
        <button className='strawberryButton' id='unbuzz' onClick={unbuzz} disabled={disabled || strawberryGame.gameState.buzzed == null}>{fruitEmoji}</button>
    </div>;
}

export default App;
