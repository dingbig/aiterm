import { useEffect, useRef, useState } from 'react';
import { Button, Card, Elevation } from "@blueprintjs/core";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import "./App.css";
import { ElectronApi } from '../electron_api';
import HelperWindow from './HelperWindow';

export const App = () => {
  const [count, setCount] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const electronApi = (window as any).electronApi as ElectronApi;

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


    return () => {
      clearTimeout(timeoutId);
      terminal.dispose();
    };
  }, []);

  return (
    <div className="container">
      <Card elevation={Elevation.TWO} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 1 }}>
          <div className="terminal-container" ref={terminalRef} />
          <div className="helper-container">
            <HelperWindow></HelperWindow>
          </div>
        </div>
      </Card>
    </div>
  );
};