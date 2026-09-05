# Algorithmica — A 3D World of Algorithms

An explorable 3D world of algorithm visualizations, built with React Three Fiber (Three.js).

English | [简体中文](./README.zh-CN.md)

## ✨ Features

- 🧊 Classic algorithms rendered as interactive 3D scenes (sorting, data structures, and more)
- 🎮 Immersive free-roam exploration
- 🎨 Post-processing effects (bloom, etc.)

## 🛠️ Tech Stack

React 19 · TypeScript · Vite 7 · Three.js / @react-three/fiber · Tailwind CSS 4

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Production build (outputs a single-file HTML)
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── App.tsx              # App entry
├── three/
│   ├── World.tsx        # The 3D world
│   ├── Hub.tsx          # Central hub
│   └── scenes/          # Algorithm scenes (sorting / data structures)
├── hooks/usePlayer.ts   # Player controls
└── lib/algorithms.ts    # Algorithm data
```
