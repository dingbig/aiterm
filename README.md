# AiTerm

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

AI-powered terminal enhancement tool | AI 终端增强工具

[English](#english) | [中文](#中文)

</div>

---

<a id="english"></a>
## 🌟 Overview

AiTerm is an intelligent terminal enhancement tool that integrates AI capabilities to improve your command-line experience. It provides smart suggestions, command explanations, and AI-assisted problem solving directly in your terminal.

## 🚀 Features

- AI-powered command suggestions
- Intelligent command explanations
- Cross-platform support (Windows, macOS, Linux)
- Built with Electron and React
- Integrated with advanced AI models

## 📦 Installation

### Prerequisites

1. **Node.js** (v18 or higher)
   - Download from [Node.js official website](https://nodejs.org/)

2. **Yarn Package Manager**
   ```bash
   npm install -g yarn
   ```

3. **Ollama** (for AI model support)
   - Download from [Ollama's official website](https://ollama.com/download)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aiterm.git
   cd aiterm
   ```

2. **Install dependencies**
   ```bash
   yarn install
   npm rebuild
   ```

3. **Download the AI model**
   ```bash
   ollama pull qwen3:8b
   ```

4. **Start the application**
   ```bash
   yarn run dev
   ```

## 🔧 Development

For development, make sure you have all the prerequisites installed and follow these steps:

1. Install dependencies: `yarn install`
2. Rebuild native modules: `npm rebuild`
3. Start the development server: `yarn run dev`

---

<a id="中文"></a>
## 🌟 概述

AiTerm 是一款智能终端增强工具，集成了 AI 功能以改善您的命令行体验。它可以提供智能命令建议、命令解释，并直接在终端中提供 AI 辅助问题解决方案。

## 🚀 特性

- AI 驱动的命令建议
- 智能命令解释
- 跨平台支持（Windows、macOS、Linux）
- 基于 Electron 和 React 构建
- 集成先进的 AI 模型

## 📦 安装

### 前置要求

1. **Node.js** (v18 或更高版本)
   - 从 [Node.js 官网](https://nodejs.org/) 下载

2. **Yarn 包管理器**
   ```bash
   npm install -g yarn
   ```

3. **Ollama** (用于 AI 模型支持)
   - 从 [Ollama 官网](https://ollama.com/download) 下载

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/aiterm.git
   cd aiterm
   ```

2. **安装依赖**
   ```bash
   yarn install
   npm rebuild
   ```

3. **下载 AI 模型**
   ```bash
   ollama pull qwen3:8b
   ```

4. **启动应用**
   ```bash
   yarn run dev
   ```

## 🔧 开发

进行开发时，请确保已安装所有前置要求，然后按照以下步骤操作：

1. 安装依赖：`yarn install`
2. 重建原生模块：`npm rebuild`
3. 启动开发服务器：`yarn run dev`

---

## 📝 License

MIT License