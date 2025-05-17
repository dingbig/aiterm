import React, { useState } from 'react';
import {
    Card,
    InputGroup,
    Button,
    Classes,
    Elevation
} from '@blueprintjs/core';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
}

interface ChatProps {
    className?: string;
}

export const Chat: React.FC<ChatProps> = ({ className }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            text: inputValue,
            isUser: true
        };

        setMessages([...messages, newMessage]);
        setInputValue('');
    };

    return (
        <div className={className} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div 
                style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}
            >
                {messages.map((message) => (
                    <Card 
                        key={message.id}
                        elevation={Elevation.ONE}
                        style={{
                            alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            backgroundColor: message.isUser ? '#106BA3' : '#30404D',
                            color: '#FFFFFF'
                        }}
                    >
                        {message.text}
                    </Card>
                ))}
            </div>
            <div style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                <InputGroup
                    large
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className={Classes.FILL}
                />
                <Button
                    large
                    icon="send-message"
                    intent="primary"
                    onClick={handleSend}
                />
            </div>
        </div>
    );
}; 