# aiterm

AI终端

## 开发

1. 下载安装nodejs
```
https://nodejs.org/dist/v22.15.1/node-v22.15.1-x64.msi
```

2. 安装yarn

```bash
npm -g install yarn
```

3. 安装依赖

```
cd aiterm
yarn
npm rebuild

```

4. 安装ollama
`https://ollama.com/download/OllamaSetup.exe`

5. 下载模型
ollama pull qwen3:8b


6. 运行本软件

```bash
cd aiterm
yarn run dev
```