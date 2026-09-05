# Algorithmica — A 3D World of Algorithms

一个可自由探索的 3D 算法可视化世界，基于 React Three Fiber（Three.js）构建。

## ✨ 特性

- 🧊 3D 场景化展示经典算法（排序、数据结构等）
- 🎮 沉浸式视角漫游
- 🎨 后期渲染特效（泛光等）

## 🛠️ 技术栈

React 19 · TypeScript · Vite 7 · Three.js / @react-three/fiber · Tailwind CSS 4

## 🚀 运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建（输出单文件 HTML）
npm run build
npm run preview
```

## 📁 目录结构

```
src/
├── App.tsx              # 应用入口
├── three/
│   ├── World.tsx        # 3D 世界
│   ├── Hub.tsx          # 中心枢纽
│   └── scenes/          # 算法场景（排序 / 数据结构）
├── hooks/usePlayer.ts   # 玩家视角控制
└── lib/algorithms.ts    # 算法数据
```
