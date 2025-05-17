# AiTerm

<div align="center">

![版本](https://img.shields.io/badge/版本-0.0.0-blue.svg)
![许可证](https://img.shields.io/badge/许可证-MIT-green.svg)
![平台](https://img.shields.io/badge/平台-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

AI 终端增强工具

</div>

---

## 🌟 项目简介

AiTerm 是一款智能终端增强工具，集成了 AI 功能以改善您的命令行体验。它可以提供智能命令建议、命令解释，并直接在终端中提供 AI 辅助问题解决方案。

## 🚀 主要特性

- AI 驱动的命令建议
- 智能命令解释
- 跨平台支持（Windows、macOS、Linux）
- 基于 Electron 和 React 构建
- 集成先进的 AI 模型

## 📦 安装说明

### 环境要求

1. **Node.js** (v18 或更高版本)
   - 从 [Node.js 官网](https://nodejs.org/) 下载安装

2. **Yarn 包管理器**
   ```bash
   npm install -g yarn
   ```

3. **Ollama** (用于 AI 模型支持)
   - 从 [Ollama 官网](https://ollama.com/download) 下载安装

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/aiterm.git
   cd aiterm
   ```

2. **安装 Visual Studio 2022**
   ```
   https://visualstudio.microsoft.com/zh-hans/vs/
   ```

3. **安装依赖**
   ```bash
   yarn install
   npm rebuild
   ```

4. **下载 AI 模型**
   ```bash
   ollama pull qwen3:8b
   ```

5. **启动应用**
   ```bash
   yarn run dev
   ```

## 🔧 开发指南

开发前请确保已安装所有必需的环境，然后按照以下步骤操作：

1. 安装项目依赖：
   ```bash
   yarn install
   ```

2. 重建原生模块：
   ```bash
   npm rebuild
   ```

3. 启动开发服务器：
   ```bash
   yarn run dev
   ```

## 🤝 贡献指南

欢迎提交问题和改进建议！如果您想为项目做出贡献，请：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m '添加一些特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
