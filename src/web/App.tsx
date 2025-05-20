import { useEffect, useRef, useState } from 'react';
import { Alignment, Button, Card, Classes, Elevation, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from "@blueprintjs/core";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import "./App.css";
import { ElectronApi } from '../electron_api';
import HelperWindow from './HelperWindow';

export const App = () => {
  const [count, setCount] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalObj = useRef<Terminal | null>(null);
  const electronApi = (window as any).electronApi as ElectronApi;
  const [getTerminalText, setGetTerminalText] = useState(() => () => '');



  useEffect(() => {
    const terminal = new Terminal();
    const fitAddon = new FitAddon();

    const initializeTerminal = () => {
      if (terminalRef.current) {
        terminal.open(terminalRef.current);
        terminal.loadAddon(fitAddon);
        fitAddon.fit();

        const resizeObserver = new ResizeObserver(() => {
          fitAddon.fit();
        });
        resizeObserver.observe(terminalRef.current);

        terminal.onData((input) => {
          electronApi.sendToTty(input);
        });
      }
    };

    const timeoutId = setTimeout(initializeTerminal, 0);

    electronApi.listenTty(data => {
      terminal.write(data);
    });

    const onTerminalResize = () => {
      const { cols, rows } = terminal;
      electronApi.sendTerminalResize(cols, rows);
    };

    terminal.onResize(onTerminalResize);

    setGetTerminalText(() => () => {
      const selection = terminal.getSelection();
      if (selection) {
        return selection;
      } else {
        let text = '';
        const buffer = terminal.buffer.active;
        for (let i = 0; i < buffer.length; i++) {
          text += buffer.getLine(i)?.translateToString() || '';
        }
        return text;
      }
    });

    terminalObj.current = terminal;

    return () => {
      clearTimeout(timeoutId);
      terminal.dispose();
    };
  }, []);

  const writeToTerminal = (cmd: string) => {
    electronApi.sendToTty(cmd);
  };

  return (
    <div className="container">
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 1 }}>
          <div className="terminal-container" ref={terminalRef}>
          </div>
          <div className="helper-container">
            <HelperWindow getTerminalText={getTerminalText} writeToTerminal={writeToTerminal}></HelperWindow>
          </div>
        </div>
      </div>
    </div>
  );
};