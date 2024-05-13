export type TtyCallback = (data: string | Uint8Array) => void;
export interface ElectronApi {
  sendToTty: (data: string) => void;
  listenTty: (callback: TtyCallback) => void;
  sendTerminalResize: (cols: number, rows: number) => void;
}