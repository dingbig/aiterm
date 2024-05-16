import { ElectronApi, TtyCallback } from './electron_api';

console.log("preloaded!");
const { contextBridge, ipcRenderer, shell } = require('electron');
let ttyCallback: TtyCallback

const electronApi: ElectronApi = {
  sendToTty: async (data: string) => {
    ipcRenderer.send("terminal-input", data);
  },
  listenTty: (callback: TtyCallback) => {
    ttyCallback = callback;
  },
  sendTerminalResize: (cols: number, rows: number) => {
    ipcRenderer.send("terminal-resize", { cols, rows });
  }
}
contextBridge.exposeInMainWorld('electronApi', electronApi);

ipcRenderer.on("terminal-output", (event: any, output: string | Uint8Array) => {
  if(ttyCallback) {
    ttyCallback(output)
  }
});

