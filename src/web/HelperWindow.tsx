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
  writeToTerminal: (cmd: string) => void;
}

interface Message {
  id: number;
  text: string;
  sender: string;
  collapsedThink?: boolean;
  type?: string;
}

const HelperWindow: FC<HelperWindowProps> = (props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkCollapseMap, setThinkCollapseMap] = useState<{ [id: number]: boolean }>({});
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelInfo | undefined>();
  const [isModelWorking, setIsModelWorking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageListRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeModel = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        if (data.models && data.models.length > 0) {
          const firstModel = data.models[0];
          setSelectedModel({
            name: firstModel.name,
            model: firstModel.name,
            digest: firstModel.digest || '',
            size: firstModel.size || '0',
            modified: new Date(firstModel.modified_at || Date.now()).toISOString()
          });
        }
      } catch (error) {
        console.error('Error fetching initial model:', error);
      }
    };

    if (!selectedModel) {
      initializeModel();
    }
  }, []);

  const handleTranslateClick = async () => {
    await askLlm('Please explain the translated text into Chinese: ' + props.getTerminalText());
  };

  const handleBugClick = async () => {
    console.log('Terminal text:', props.getTerminalText());
    await askLlm('请根据以下终端输出，用清晰而简洁的语言解释这是什么问题：\n```bash\n' + props.getTerminalText() + '\n```');
  };

  const handleCodeClick = async () => {
    const terminalText = props.getTerminalText();
    const cmd = await askLlm(
      `请根据以下终端输出，建议用户下一步可以在控制台执行什么命令。注意你的回答必须以纯文本格式包含一条命令。终端输出：\n` +
      '```bash\n' + terminalText + '\n```'
    );
    if (cmd) {
      props.writeToTerminal(cmd);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: '已粘贴到终端',
          sender: '系统',
          type: 'tips'
        }
      ]);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsModelWorking(false);
    }
  };

  const askLlm = async (question: string): Promise<string> => {
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

    let aiReply = '';

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
              aiReply = chunks.join("");
              setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1]['text'] = aiReply;
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
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            text: '已停止生成',
            sender: '系统',
            type: 'error'
          }
        ]);
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

    const thinkRegex = /<think>[\s\S]*?(<\/think>|$)/i;
    const result = aiReply.replace(thinkRegex, '').trim();
    return result;
  }

  const handleSendMessage = async () => {
    if (inputText.trim() !== '' && !isModelWorking) {
      await askLlm(inputText.trim());
    }
  };

  const handleModelSelect = async (model: ModelInfo) => {
    console.log('Selected model:', model);
    setSelectedModel(model);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isModelWorking) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 2;
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const toggleThinkCollapse = (id: number) => {
    setThinkCollapseMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderMessageText = (message: Message) => {
    if (message.type === 'error') {
      return (
        <div className="system-error">
          {message.text}
        </div>
      );
    }
    if (message.type === 'tips') {
      return (
        <div className="system-tip">
          {message.text}
        </div>
      );
    }

    const thinkRegex = /<think>([\s\S]*?)(<\/think>|$)/i;
    const match = message.text.match(thinkRegex);

    if (match) {
      const beforeThink = message.text.slice(0, match.index);
      const thinkContent = match[1];
      const afterThink = match[2] === '</think>'
        ? message.text.slice(match.index! + match[0].length)
        : '';

      const collapsed = !thinkCollapseMap[message.id];

      return (
        <span>
          {/* before think */}
          {beforeThink && (
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {beforeThink}
            </Markdown>
          )}
          {/* think fold */}
          <div className="think-block">
            <div
              className="think-toggle"
              onClick={() => toggleThinkCollapse(message.id)}
            >
              {collapsed ? '显示思考 ▼' : '收起思考 ▲'}
            </div>
            {!collapsed && (
              <div className="think-content">
                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {thinkContent}
                </Markdown>
              </div>
            )}
          </div>
          {/* after think */}
          {afterThink && (
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {afterThink}
            </Markdown>
          )}
        </span>
      );
    } else {
      return (
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {message.text}
        </Markdown>
      );
    }
  };

  return (
    <div className="chat-window">
      <div className="top-bar">
        <Button
          icon="bug"
          intent="primary"
          onClick={handleBugClick}
          disabled={isModelWorking}
        />
        <Button
          icon="help"
          intent="primary"
          disabled={isModelWorking}
        />
        <Button
          icon="code"
          intent="primary"
          onClick={handleCodeClick}
          disabled={isModelWorking}
        />
        <Button
          icon="media"
          intent="primary"
          disabled={isModelWorking}
        />
        <Button
          icon="translate"
          intent="primary"
          onClick={handleTranslateClick}
          disabled={isModelWorking}
        />
        {isModelWorking && (
          <Button
            icon="stop"
            intent="danger"
            onClick={handleStopGeneration}
          >停止生成</Button>
        )}
        <div className="model-select-container">
          <ModelSelect
            onModelSelect={handleModelSelect}
            disabled={isModelWorking}
          />
        </div>
      </div>
      <div className="message-list" ref={messageListRef}>
        {messages.map((message) =>
          message.type === 'error' || message.type === 'tips' ? (
            <div key={message.id} className="system-message">
              {renderMessageText(message)}
            </div>
          ) : (
            <div
              key={message.id}
              className={`message-bubble ${message.sender === '我' ? 'from-user' : 'from-ai'}`}
            >
              <div className="bubble-content">
                {renderMessageText(message)}
              </div>
            </div>
          )
        )}
      </div>
      <div className="input-container">
        <InputGroup
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="说点什么..."
          onKeyDown={handleKeyDown}
          disabled={isModelWorking}
          rightElement={
            <Button
              icon="send-message"
              onClick={handleSendMessage}
              large={true}
              intent="primary"
              disabled={isModelWorking || !inputText.trim()}
            />
          }
        />
      </div>
    </div>
  );
};

export default HelperWindow;
