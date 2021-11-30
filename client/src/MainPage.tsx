import React, {useState, useContext} from 'react';
import { FruitEmojiContext } from './Fruit';
import { LinkButton } from './LinkButton';

type setUsernameFn = (username: string | null) => void;
type createGameFn = () => void;

function MainPage({isLoggedIn, setUsername, createGame, changeFruit}: {
    isLoggedIn: boolean,
    setUsername: setUsernameFn,
    createGame: createGameFn,
    changeFruit: () => void,
}) {
    return (
        <div className='mainContainer'>
            <div className='mainPageContent'>
                <BigStrawberry onClick={changeFruit} />
                <div className='mainPageControl'>
                    {isLoggedIn ? <StartNewGame createGame={createGame} setUsername={setUsername} /> : <SetUsername setUsername={setUsername} />}
                </div>
            </div>
        </div>
    )
}

function SetUsername({setUsername}: {setUsername: setUsernameFn}) {
    return <div style={{textAlign: 'center'}}>
        What's your name?
        <UsernameInput setUsername={setUsername}/>
    </div>;

}
function UsernameInput({setUsername}: {setUsername: setUsernameFn}) {
    const [input, setInput] = useState('');
    return <form onSubmit={(e) => {
        e.preventDefault();

        if (input !== '') {
            setUsername(input);
        }
    }}>
        <input className='strawberryInput strawberryInputBig' value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
    </form>
}

function StartNewGame({createGame, setUsername}: {createGame: createGameFn, setUsername: setUsernameFn}) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(window.Notification?.permission);
    const enableNotifications = () => {
        window.Notification.requestPermission().then(() => {
            setNotificationsEnabled(Notification.permission);
        });
    };
    return <>
        <button className='strawberryButton' onClick={() => createGame()}>Start new game</button>

        {false && "Notification" in window &&
        <div className='enableNotifications'>
            <LinkButton onClick={enableNotifications} isDisabled={notificationsEnabled !== "default"}>
                {notificationsEnabled === "granted" ? "Notifications enabled!" : "Enable notifications"}
            </LinkButton>
        </div>
        }

        <div className='logOut'>
            <LinkButton onClick={() => setUsername(null)}>Log out</LinkButton>
        </div>
    </>;
}

function BigStrawberry({onClick}: {onClick: () => void}) {
    const fruitEmoji = useContext(FruitEmojiContext);
    return <div className='bigStrawberry' onClick={onClick}>{fruitEmoji}</div>;
}

export {MainPage};
