# 整站导航与模块结构

## 底部导航（4 个入口）

| 顺序 | 名称 | 路径 | 说明 |
|------|------|------|------|
| 1 | 消息 | `/msg` | 消息与对话 |
| 2 | 任务 | `/tasks` | 任务管理 |
| 3 | 组织 | `/org` | 组织与团队 |
| 4 | 我的 | `/me` | 个人中心 |

- 根路径 `/` 会重定向到 `/msg`。
- 导航配置：`app/config/nav.ts`
- 底部导航组件：`app/components/BottomNav.tsx`

---

## 功能模块与页面结构

### 1. 消息（/msg）

- **入口**：`/msg` — 消息列表
- **相关页面**：
  - `/chat` — AI 对话（CopilotKit，独立 layout）
- **后续可扩展**：`/msg/agent/[id]` 单聊、会话详情等

### 2. 任务（/tasks）

- **入口**：`/tasks` — 任务列表
- **后续可扩展**：`/tasks/[id]` 任务详情、`/tasks/new` 创建任务等

### 3. 组织（/org）

- **入口**：`/org` — 组织概览
- **后续可扩展**：`/org/[id]` 团队/部门详情、成员、设置等

### 4. 我的（/me）

- **入口**：`/me` — 个人中心
- **后续可扩展**：`/me/settings` 设置、`/me/profile` 资料等

---

## 文件结构（与导航相关）

```
app/
  config/
    nav.ts              # 底部导航配置与 getActiveNavKey
  layout.tsx            # 根 layout，包含 BottomNav 与主内容区 padding
  page.tsx              # 首页 → redirect /msg
  msg/
    page.tsx            # 消息模块入口
  tasks/
    page.tsx            # 任务模块入口
  org/
    page.tsx            # 组织模块入口
  me/
    page.tsx            # 我的模块入口
  chat/
    layout.tsx          # CopilotKit 布局
    page.tsx            # AI 对话页（从消息模块可跳转）

  components/
    BottomNav.tsx       # 底部导航组件
```

新增子页面时，只要路径以 `/msg`、`/tasks`、`/org`、`/me` 开头，底部导航会正确高亮对应 tab。
