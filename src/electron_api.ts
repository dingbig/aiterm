export type TtyCallback = (data: string | Uint8Array) => void;
export type ListModelsCallback = (models: string[]) => void;
export interface ModelInfo {
  name: string;
  model: string;
  digest: string;
  size: string;
  modified: string;
}

export interface ElectronApi {
  sendToTty: (data: string) => void;
  listenTty: (callback: TtyCallback) => void;
  sendTerminalResize: (cols: number, rows: number) => void;
}