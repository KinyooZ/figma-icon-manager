# Figma Icon Manager

[English](#english) | [中文](#中文)

---

## English

A Figma plugin that scans your icon library and publishes React components to GitHub with one click. Designed to streamline the workflow between designers and frontend teams for maintaining a custom icon system.

### Features

- **Three categories**: `Outlined` / `Filled` / `Colored` — handled with different color strategies
- **Naming validation**: PascalCase enforcement, duplicate detection, with Chinese error messages
- **Smart color handling**: Automatically strips hardcoded colors from SVG so `currentColor` / `color` prop works correctly
- **One-click publish**: Pushes all generated components as a single GitHub commit via Git Data API
- **Persistent config**: GitHub credentials saved locally via `figma.clientStorage`

### Figma File Convention

Your Figma file must follow these rules (validated by the plugin):

1. At least one **Page** whose name contains `icon` (case-insensitive)
2. Under that page, top-level **Frames** must end with `Outlined`, `Filled`, or `Colored`
3. All icon **Components** must use **PascalCase** naming (e.g. `ArrowUp`, `ChevronDown`)
4. No duplicate names within the same category

### Usage

1. **Import plugin** — In Figma: `Plugins → Development → Import plugin from manifest...` → select `manifest.json`
2. **Configure GitHub** — Click Settings, fill in:
   - Personal Access Token (needs `repo` scope)
   - Repository owner / name
   - Target branch (e.g. `main`)
   - Base path in repo (e.g. `src/icons`)
3. **Scan icons** — Validates the file structure and naming
4. **Publish** — Pushes generated components to GitHub

### Output Structure

```
<basePath>/
├── types.ts              # Shared IconProps type
├── index.ts              # Re-exports Outlined / Filled / Colored namespaces
├── outlined/
│   ├── ArrowUp.tsx       # forwardRef, supports size / color / strokeWidth
│   └── index.ts
├── filled/
│   ├── Heart.tsx         # forwardRef, supports size / color
│   └── index.ts
└── colored/
    ├── Flag.tsx          # forwardRef, preserves original colors
    └── index.ts
```

Usage in your React app:

```tsx
import { Outlined, Filled, Colored } from '@/icons';

<Outlined.ArrowUp size={20} color="#FF0000" />
<Filled.Heart className="text-red-500" />
<Colored.Flag size={32} />
```

### Development

```bash
npm install
npm run build      # Build for production
npm run dev        # Watch mode for development
```

Then in Figma, import `manifest.json` via `Plugins → Development → Import plugin from manifest...`

### Tech Stack

- TypeScript + React 18
- Webpack 5 (with inline script bundling for Figma UI)
- GitHub REST API (Git Data API for atomic multi-file commits)

### License

MIT © KinyooZ

---

## 中文

一个 Figma 图标管理插件：扫描 Figma 文件中的图标，一键发布 React 组件到 GitHub 仓库。用于打通设计师和前端之间的协作流程，统一维护自定义图标系统。

### 核心功能

- **三大分类**：`Outlined` / `Filled` / `Colored`，按类型分别处理颜色
- **命名校验**：强制大驼峰命名、检测重名，所有报错中文提示
- **智能颜色处理**：自动剥离 SVG 中的硬编码颜色，使 `currentColor` / `color` 属性正确生效
- **一键发布**：通过 GitHub Git Data API 以**单次 commit** 批量推送所有组件
- **配置持久化**：GitHub 凭据通过 `figma.clientStorage` 本地保存

### Figma 文件规范

Figma 文件必须遵循以下结构（插件会校验）：

1. 至少有一个名称**包含 `icon`** 的 Page（不区分大小写）
2. Page 下的顶层 Frame 必须以 `Outlined` / `Filled` / `Colored` 结尾
3. 所有 icon Component 必须使用**大驼峰命名**（如 `ArrowUp`、`ChevronDown`）
4. 同一分类内组件名不可重复

### 使用流程

1. **导入插件** — 在 Figma 中：`Plugins → Development → Import plugin from manifest...` → 选择 `manifest.json`
2. **配置 GitHub** — 点击设置，填入：
   - Personal Access Token（需要 `repo` 权限）
   - 仓库拥有者 / 名称
   - 目标分支（如 `main`）
   - 图标文件在仓库中的基础路径（如 `src/icons`）
3. **扫描图标** — 校验 Figma 文件结构和命名
4. **发布** — 推送生成的组件到 GitHub

### 生成文件结构

```
<basePath>/
├── types.ts              # 共享的 IconProps 类型
├── index.ts              # 入口文件，re-export Outlined / Filled / Colored 命名空间
├── outlined/
│   ├── ArrowUp.tsx       # forwardRef 组件，支持 size / color / strokeWidth
│   └── index.ts
├── filled/
│   ├── Heart.tsx         # forwardRef 组件，支持 size / color
│   └── index.ts
└── colored/
    ├── Flag.tsx          # forwardRef 组件，保留原始颜色
    └── index.ts
```

在 React 项目中使用：

```tsx
import { Outlined, Filled, Colored } from '@/icons';

<Outlined.ArrowUp size={20} color="#FF0000" />
<Filled.Heart className="text-red-500" />
<Colored.Flag size={32} />
```

### 本地开发

```bash
npm install
npm run build      # 生产构建
npm run dev        # 开发模式（watch）
```

构建完成后，在 Figma 中通过 `Plugins → Development → Import plugin from manifest...` 导入 `manifest.json`。

### 技术栈

- TypeScript + React 18
- Webpack 5（Figma UI 使用 inline script 打包）
- GitHub REST API（通过 Git Data API 实现原子性多文件 commit）

### 开源协议

MIT © KinyooZ
