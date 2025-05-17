# aiterm

AI终端

## 开发
1. 下载安装python
```
https://www.python.org/ftp/python/3.14.0/python-3.14.0b1-amd64.exe
```
2. 下载安装nodejs
```
https://nodejs.org/dist/v22.15.1/node-v22.15.1-x64.msi
```

3. 安装yarn

```bash
npm -g install yarn
```

4. 安装依赖

```
cd aiterm
yarn
npm rebuild

```

5. 安装ollama
`https://ollama.com/download/OllamaSetup.exe`

6. 下载模型
ollama pull qwen3:8b


7. 运行本软件

```bash
cd aiterm
yarn run dev
```