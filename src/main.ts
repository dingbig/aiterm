import path from "node:path";
import { BrowserWindow, app, ipcMain, session } from "electron";
import { spawn } from "node-pty";
import { exec } from 'child_process';
import os from "os";


if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: path.resolve(
      __dirname,
      process.platform === "win32"
        ? "../node_modules/electron/dist/electron.exe"
        : "../node_modules/.bin/electron",
    ),
    forceHardReset: true,
    hardResetMethod: "exit",
  });
}


app.whenReady().then(() => {


  const mainWindow = new BrowserWindow({
    webPreferences: {

      preload: path.resolve(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false, // Disable web security
      allowRunningInsecureContent: true, // Allow insecure content



    },
  });


  // Set the Content Security Policy headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = Object.assign({}, details.responseHeaders);
    delete responseHeaders['content-security-policy'];
    callback({ responseHeaders });
  });
  mainWindow.loadFile("dist/index.html");
  mainWindow.webContents.openDevTools({ mode: "detach" });

  ipcMain.on("terminal-input", (event, input: string) => {
    ptyProcess.write(input);
  });

  ipcMain.on("terminal-resize", (event, { cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });



  const shell = os.platform() === "win32" ? "cmd.exe" : os.platform() === "darwin"? "zsh" : "bash";
  const ptyProcess = spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.onData( (data) => {
    mainWindow.webContents.send("terminal-output", data);
  });

});

app.once("window-all-closed", () => app.quit());
