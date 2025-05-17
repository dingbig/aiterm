import path from "node:path";
import { BrowserWindow, app, ipcMain, session } from "electron";
import { WebSocket, WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import * as os from 'os';

// Convert process.env to ensure all values are strings
const processEnv: { [key: string]: string } = {
  ...process.env,
  TERM: 'xterm-256color',
  COLORTERM: 'truecolor',
  LANG: process.env.LANG || 'en_US.UTF-8',
  PS1: '\\u@\\h:\\w\\$ ',  // 设置提示符
};

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

let mainWindow: BrowserWindow | null = null;
const isDevelopment = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  if (isDevelopment) {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }
}

// 创建WebSocket服务器
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  console.log('New terminal connection');

  // 根据操作系统选择合适的shell和参数
  let shellCommand: string;
  let shellArgs: string[];
  
  if (process.platform === 'win32') {
    shellCommand = 'powershell.exe';
    shellArgs = ['-NoLogo'];
  } else {
    shellCommand = process.env.SHELL || '/bin/bash';
    shellArgs = ['--login', '-i']; // 以登录和交互模式启动
  }

  const homeDir = os.homedir();
  console.log('Starting shell:', shellCommand, shellArgs);
  console.log('Home directory:', homeDir);

  const shellProcess = spawn(shellCommand, shellArgs, {
    env: processEnv,
    cwd: homeDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: false
  });

  // 将shell输出发送到WebSocket客户端
  shellProcess.stdout.on('data', (data) => {
    if (ws.readyState === ws.OPEN) {
      console.log('Shell stdout:', data.toString());
      ws.send(data.toString());
    }
  });

  shellProcess.stderr.on('data', (data) => {
    if (ws.readyState === ws.OPEN) {
      console.log('Shell stderr:', data.toString());
      ws.send(data.toString());
    }
  });

  // 接收WebSocket客户端的输入并发送到shell
  ws.on('message', (message: Buffer) => {
    try {
      const data = message.toString();
      
      // 尝试解析JSON消息
      try {
        const jsonMessage = JSON.parse(data);
        if (jsonMessage.type === 'resize') {
          // 处理终端大小调整
          const { rows, cols } = jsonMessage.dims;
          if (process.platform !== 'win32' && shellProcess.pid) {
            // 在类Unix系统上使用SIGWINCH信号
            process.kill(shellProcess.pid, 'SIGWINCH');
          }
          return;
        }
      } catch (e) {
        // 不是JSON消息，作为普通输入处理
      }

      // 普通输入处理
      if (shellProcess.stdin.writable) {
        // 如果是换行符，确保使用系统对应的换行符
        if (data === '\n') {
          shellProcess.stdin.write(process.platform === 'win32' ? '\r\n' : '\n');
        } else {
          shellProcess.stdin.write(data);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // 处理WebSocket关闭
  ws.on('close', () => {
    console.log('WebSocket closed');
    if (!shellProcess.killed) {
      shellProcess.kill();
    }
  });

  // 处理shell进程退出
  shellProcess.on('exit', (code) => {
    console.log('Shell process exited with code:', code);
    if (ws.readyState === ws.OPEN) {
      ws.close();
    }
  });

  // 处理错误
  shellProcess.on('error', (error) => {
    console.error('Shell process error:', error);
    if (ws.readyState === ws.OPEN) {
      ws.send(`\x1b[1;31mError: ${error.message}\x1b[0m\r\n`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // 连接后发送初始命令
  setTimeout(() => {
    if (shellProcess.stdin.writable) {
      shellProcess.stdin.write('\n');  // 触发提示符显示
    }
  }, 100);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
