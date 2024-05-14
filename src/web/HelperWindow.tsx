import React, { FC, useState } from 'react';
import { Button, InputGroup } from '@blueprintjs/core';
import './HelperWindow.css'; // Import the CSS file for additional styles
import { Ollama } from "@langchain/community/llms/ollama";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";
import { HumanMessage, SystemMessage, FunctionMessage, ChatMessage, AIMessage, AIMessageChunk } from "@langchain/core/messages";

import { DynamicTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";

import { 
  SystemMessagePromptTemplate, 
  HumanMessagePromptTemplate, 
  ChatPromptTemplate
} from "@langchain/core/prompts"
import Markdown from 'react-markdown'
import 'highlight.js/styles/github.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm'
interface HelperWindowProps {
  getTerminalText: () => string;
}

interface Message {
  id: number;
  text: string;
  sender: string;
}

const HelperWindow: FC<HelperWindowProps> = (props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const renderers = {
    code: ({ language, value }) => {
      return <SyntaxHighlighter language={language} style={github}>{value}</SyntaxHighlighter>;
    },
  };

  const handleTranslateClick = async () => {
    await askLlm("Please explain the translated text into Chinese: " + props.getTerminalText());
  };


  const handleBugClick = async () => {
    console.log('Terminal text:', props.getTerminalText());
    await askLlm("解释下这是什么问题：\n```bash\n" + props.getTerminalText() + "\n```");
  };

  const askLlm = async (question: string) => {
    const userText = question;
    const outgoingId = messages.length + 1;
    const incomingId = messages.length + 2;

    const newMessages = [...messages]; // Create a new array copy
    const outgoingMessage: Message = {
      id: outgoingId,
      text: userText,
      sender: '我',
    };
    newMessages.push(outgoingMessage);

    // Update the state with the new outgoing message
    setMessages(newMessages);

    setInputText('');

    const incomingMessage: Message = {
      id: incomingId,
      text: '正在思考中...',
      sender: '人工智能',
    };
    newMessages.push(incomingMessage);

    // Update the state with the incoming message
    setMessages(newMessages);

    const ollama = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: "qwen:14b-chat",
    });
    
    
    const stream = await ollama.stream(userText);
    const chunks = [];
    for await (const chunk of stream) {
      console.log(JSON.stringify(chunk));
      console.log(chunk as any['type']);
      if(chunk instanceof AIMessageChunk){
        const ac = chunk as AIMessageChunk;
        chunks.push(ac.content);
      } 
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]; // Create a new copy of the messages array
        updatedMessages[updatedMessages.length - 1]['text'] = chunks.join("");
        return updatedMessages;
      });
    }

    // Update the text of the last incoming message
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages]; // Create a new copy of the messages array
      updatedMessages[updatedMessages.length - 1]['text'] = chunks.join("");
      return updatedMessages;
    });
  }

  const handleSendMessage = async () => {
    if (inputText.trim() !== '') {
      await askLlm(inputText.trim());
    }
  };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };



  
  return (
    <div className="chat-window">
      <div className="top-bar">
        <Button icon="bug" intent="primary" onClick={handleBugClick} />
        <Button icon="help" intent="primary"></Button>
        <Button icon="code" intent="primary"></Button>
        <Button icon="media" intent="primary"></Button>
        <Button icon="translate" intent="primary" onClick={handleTranslateClick}></Button>
      </div>
      <div className="message-list">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <span className="sender">{message.sender}: </span>
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.text}
            </Markdown>
          </div>
        ))}
      </div>
      <div className="input-container">
        <InputGroup
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="说点什么..."
          onKeyDown={handleKeyDown}
          rightElement={
            <Button icon="send-message" onClick={handleSendMessage} large={true} intent="primary">
            </Button>
          }
        />
      </div>
    </div>


  );
};

export default HelperWindow;
