import React, { FC, useEffect, useState, useRef } from 'react';
import { Button, InputGroup } from '@blueprintjs/core';
import './HelperWindow.css'; // Import the CSS file for additional styles
import { Ollama } from "@langchain/community/llms/ollama";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";
import { HumanMessage, SystemMessage, FunctionMessage, ChatMessage, AIMessage, AIMessageChunk, MessageContent } from '@langchain/core/messages';

import { DynamicTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';

import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from '@langchain/core/prompts';
import Markdown from 'react-markdown';
import 'highlight.js/styles/github.css';

import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { useModelList } from './utils/ModelList';
import { ModelSelect } from './utils/ModelSelect';
import { ModelInfo } from '../electron_api';

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
  const [selectedModel, setSelectedModel] = useState<ModelInfo | undefined>();
  const [isModelWorking, setIsModelWorking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageListRef = React.useRef<HTMLDivElement>(null);

  const handleTranslateClick = async () => {
    await askLlm('Please explain the translated text into Chinese: ' + props.getTerminalText());
  };

  const handleBugClick = async () => {
    console.log('Terminal text:', props.getTerminalText());
    await askLlm('解释下这是什么问题：\n```bash\n' + props.getTerminalText() + '\n```');
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsModelWorking(false);
    }
  };

  const askLlm = async (question: string) => {
    const userText = question;
    const outgoingId = messages.length + 1;
    const incomingId = messages.length + 2;

    const newMessages = [...messages];
    const outgoingMessage: Message = {
      id: outgoingId,
      text: userText,
      sender: '我',
    };
    newMessages.push(outgoingMessage);

    setMessages(newMessages);
    setInputText('');
    setIsModelWorking(true);

    const incomingMessage: Message = {
      id: incomingId,
      text: '正在思考中...',
      sender: '人工智能',
    };
    newMessages.push(incomingMessage);
    setMessages(newMessages);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel?.model ?? 'N/A',
          prompt: userText,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              chunks.push(parsed.response);
              setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1]['text'] = chunks.join("");
                return updatedMessages;
              });
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1]['text'] = chunks.join("");
        return updatedMessages;
      });

    } catch (err: unknown) {
      console.error('Error during stream:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          if (!updatedMessages[updatedMessages.length - 1]['text'].endsWith('[已停止生成]')) {
            updatedMessages[updatedMessages.length - 1]['text'] += '\n\n[已停止生成]';
          }
          return updatedMessages;
        });
      } else {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const errorMessage = err instanceof Error ? err.message : String(err);
          updatedMessages[updatedMessages.length - 1]['text'] = `发生错误: ${errorMessage}`;
          return updatedMessages;
        });
      }
    } finally {
      setIsModelWorking(false);
      abortControllerRef.current = null;
    }
  }

  const handleSendMessage = async () => {
    if (inputText.trim() !== '') {
      await askLlm(inputText.trim());
    }
  };

  const handleModelSelect = async (model: ModelInfo) => {
    console.log('Selected model:', model);
    setSelectedModel(model);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="top-bar">
        <Button icon="bug" intent="primary" onClick={handleBugClick} />
        <Button icon="help" intent="primary"></Button>
        <Button icon="code" intent="primary"></Button>
        <Button icon="media" intent="primary"></Button>
        <Button icon="translate" intent="primary" onClick={handleTranslateClick}></Button>
        {isModelWorking && (
          <Button 
            icon="stop" 
            intent="danger" 
            onClick={handleStopGeneration}
          >停止生成</Button>
        )}
        <div className="model-select-container">
          <ModelSelect onModelSelect={handleModelSelect} />
        </div>
      </div>
      <div className="message-list" ref={messageListRef}>
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
