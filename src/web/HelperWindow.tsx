import React, { FC, useState } from 'react';
import { Card, Button, InputGroup } from '@blueprintjs/core';
import './HelperWindow.css'; // Import the CSS file for additional styles

interface Message {
  id: number;
  text: string;
  sender: string;
}

const HelperWindow: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (inputText.trim() !== '') {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        sender: 'User',
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  return (
    <Card className="chat-window">
      <div className="message-list">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <span className="sender">{message.sender}: </span>
            <span className="text">{message.text}</span>
          </div>
        ))}
      </div>
      <div className="input-container">
        <InputGroup
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          rightElement={
            <Button onClick={handleSendMessage} minimal={true} intent="primary">
              Send
            </Button>
          }
        />
      </div>
    </Card>
  );
};

export default HelperWindow;
