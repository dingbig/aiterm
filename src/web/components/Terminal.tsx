import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
    className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ className }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // 创建终端实例
        const term = new XTerm({
            cursorBlink: true,
            fontSize: 14,
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff'
            },
            convertEol: true,
            scrollback: 1000,
            allowProposedApi: true,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            lineHeight: 1.2,
            letterSpacing: 0,
            windowsMode: process.platform === 'win32'
        });

        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        term.loadAddon(fitAddon);
        
        // 打开终端
        term.open(terminalRef.current);
        xtermRef.current = term;

        // 使用 requestAnimationFrame 确保DOM已经完全渲染
        requestAnimationFrame(() => {
            try {
                if (fitAddonRef.current) {
                    fitAddonRef.current.fit();
                }
                term.focus();
            } catch (e) {
                console.error('Error during initial fit:', e);
            }
        });

        // 连接WebSocket
        console.log('Connecting to WebSocket...');
        const ws = new WebSocket('ws://localhost:8080');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            term.write('\x1b[1;32mConnected to terminal.\x1b[0m\r\n');
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            term.write('\x1b[1;31mDisconnected from terminal.\x1b[0m\r\n');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            term.write('\x1b[1;31mWebSocket error occurred.\x1b[0m\r\n');
        };

        // 处理从服务器接收到的数据
        ws.onmessage = (event) => {
            if (term) {
                term.write(event.data);
            }
        };

        // 处理终端数据输入
        term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                const charCode = data.charCodeAt(0);
                
                // 处理特殊按键
                if (charCode === 3) {
                    // Ctrl+C
                    ws.send('\x03');
                } else if (charCode === 4) {
                    // Ctrl+D
                    ws.send('\x04');
                } else if (charCode === 26) {
                    // Ctrl+Z
                    ws.send('\x1A');
                } else if (data === '\r') {
                    // 回车键 - 只发送 \n
                    ws.send('\n');
                } else {
                    ws.send(data);
                }
            }
        });

        // 处理终端大小调整
        const handleResize = () => {
            try {
                if (fitAddonRef.current && term) {
                    fitAddonRef.current.fit();
                    const dims = { cols: term.cols, rows: term.rows };
                    // 发送终端大小到服务器
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'resize', dims }));
                    }
                }
            } catch (e) {
                console.error('Error during resize:', e);
            }
        };

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);

        // 初始化大小后的一段时间再次适应大小
        setTimeout(handleResize, 100);

        // 清理函数
        return () => {
            console.log('Cleaning up terminal...');
            window.removeEventListener('resize', handleResize);
            if (term) {
                term.dispose();
            }
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    return (
        <div 
            ref={terminalRef} 
            className={className}
            style={{ 
                height: '100%', 
                width: '100%',
                padding: '4px'
            }}
            onClick={() => {
                if (xtermRef.current) {
                    xtermRef.current.focus();
                }
            }}
            onFocus={() => {
                if (xtermRef.current) {
                    xtermRef.current.focus();
                }
            }}
        />
    );
}; 