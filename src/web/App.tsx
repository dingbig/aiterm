import React from 'react';
import { Terminal } from './components/Terminal';
import { Chat } from './components/Chat';
import { FocusStyleManager } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import './App.css';

// Disable focus outline for mouse users, but keep it for keyboard users
FocusStyleManager.onlyShowFocusOnTabs();

const App: React.FC = () => {
    return (
        <div className="app-container">
            <div className="terminal-container">
                <Terminal />
            </div>
            <div className="chat-container">
                <Chat />
            </div>
        </div>
    );
};

export default App;