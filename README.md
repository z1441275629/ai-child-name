# 新生儿智能起名系统

## 项目简介

这是一个基于React和TypeScript开发的新生儿智能起名系统，旨在帮助父母为新生儿起一个富有中国文化内涵的名字。系统通过调用AI模型（deepseek-ai/DeepSeek-R1），结合父母的姓名、出生日期以及宝宝的出生日期和性别，为用户生成5个中文名字，并提供每个名字的中英文寓意解释。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 7
- **样式**: CSS3 (自定义变量 + 响应式设计)
- **AI服务**: SiliconFlow API (deepseek-ai/DeepSeek-R1模型)
- **包管理器**: npm

## 功能特点

1. **用户友好的表单界面**：输入父母信息和宝宝信息的直观表单
2. **智能名字生成**：基于AI模型生成富有中国文化内涵的名字
3. **详细的寓意解释**：每个名字都提供中英文两种语言的寓意解释
4. **美观的UI设计**：温馨的配色方案和优雅的动画效果
5. **完全响应式**：适配各种屏幕尺寸的设备

## 项目结构

```
├── .env                # 环境变量配置文件（存储API密钥等）
├── .gitignore          # Git忽略文件配置
├── index.html          # HTML入口文件
├── package.json        # 项目依赖和脚本配置
├── public/             # 静态资源目录
├── src/                # 源代码目录
│   ├── App.css         # 主样式文件
│   ├── App.tsx         # 主应用组件
│   ├── assets/         # 资源文件
│   ├── index.css       # 全局样式
│   └── main.tsx        # React入口文件
├── tsconfig.app.json   # TypeScript应用配置
├── tsconfig.json       # TypeScript全局配置
├── tsconfig.node.json  # TypeScript Node配置
└── vite.config.ts      # Vite配置文件
```

## 安装与运行

### 前提条件

- Node.js 18+ 
- npm 9+ 或其他兼容的包管理器

### 安装步骤

1. 克隆项目代码

```bash
git clone <项目仓库地址>
cd children_name
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

确保项目根目录下存在 `.env` 文件，并包含以下内容：

```env
VITE_API_KEY=你的API密钥
VITE_API_URL=https://api.siliconflow.cn/v1/chat/completions
```

4. 启动开发服务器

```bash
npm run dev
```

5. 构建生产版本

```bash
npm run build
```

构建后的文件将生成在 `dist` 目录中。

## 使用说明

1. 在首页表单中填写以下信息：
   - 父亲姓名和出生日期
   - 母亲姓名和出生日期
   - 宝宝出生日期和性别

2. 点击"生成名字"按钮，系统将调用AI模型生成5个中文名字

3. 查看生成的名字列表，每个名字都包含：
   - 中文名字
   - 中文寓意解释
   - 英文寓意解释

## 注意事项

- 系统依赖于SiliconFlow API服务，请确保您的API密钥有效且有足够的配额
- 生成名字的时间可能因网络状况和API响应时间而有所不同
- 所有填写的个人信息仅用于生成名字，不会被存储或分享

## License

MIT License

© 2024 新生儿智能起名系统 - 结合中国传统文化的智能命名服务
