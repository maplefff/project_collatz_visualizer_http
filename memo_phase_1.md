# 階段一備忘錄：文件導覽與邏輯解釋

## 概覽：目標與結構

在階段一，我們的目標是搭建好專案的「骨架」，並建立一個最簡單的「溝通管道」，讓前端介面能和後端邏輯說上話。

我們把專案分成了幾個主要部分：

*   **專案父目錄**: `/Users/wu_cheng_yan/cursor/project_collatz_visualizer_http`
*   **根目錄 (`collatz_visualizer_http/`)**: 整個專案的大本營，負責管理 Electron 本身和協調前後端。路徑：`/Users/wu_cheng_yan/cursor/project_collatz_visualizer_http/collatz_visualizer_http`
*   **後端 (`backend/`)**: 負責處理「幕後」工作，比如計算 Collatz 序列（目前只有 `/api/ping` 測試）。使用 Node.js 和 Express.js，運行在 Electron 的主程序裡。
*   **前端 (`frontend/`)**: 負責使用者看到的「介面」。使用 Vue.js 和 Vite，運行在 Electron 創建的視窗裡。

---

## 文件導覽詳解

**1. 根目錄 (`collatz_visualizer_http/`)**

*   **`package.json`**:
    *   **用途**: 專案的「身分證」和「說明書」。記錄名稱、版本、依賴和腳本。
    *   **依賴 (`devDependencies`)**:
        *   `electron`: 核心框架。
        *   `electron-builder`: 打包工具。
        *   `concurrently`: 同時運行前後端開發服務的工具。
    *   **腳本 (`scripts`)**: 定義快捷命令，如 `dev:backend` (運行 `electron backend/main.js`) 和 `dev` (同時運行前後端)。
    *   **配置**: `"main": "backend/main.js"` 指定 Electron 啟動入口。

**2. 後端 (`backend/`)**

*   **`package.json`**:
    *   **用途**: 後端部分的依賴說明。
    *   **依賴 (`dependencies`)**:
        *   `express`: 網站伺服器框架，用於建立 API。
        *   `cors`: 處理跨來源資源共享 (CORS) 問題。

*   **`main.js`**:
    *   **用途**: Electron 應用的入口點和「大腦」。負責創建視窗、管理生命週期、啟動後端 Express 伺服器。
    *   **核心邏輯**:
        *   引入 Electron 和後端伺服器 (`./src/server`)。
        *   `createWindow()` 函數：
            *   異步啟動 Express 伺服器 (`await startServer()`)。
            *   創建 `BrowserWindow` (桌面視窗)。
            *   根據 `isDev` (開發/生產模式) 判斷：
                *   開發模式 (`isDev` 為 true): 等待幾秒後，加載 Vite 開發伺服器 URL (`http://localhost:5173`)，並打開開發者工具。
                *   生產模式 (`isDev` 為 false): 加載打包好的靜態 HTML 文件 (`path.join(app.getAppPath(), 'frontend/dist/index.html')`)。
        *   監聽 Electron 的 `app` 事件 (如 `whenReady`, `window-all-closed`, `will-quit`, `activate`) 來管理應用生命週期和關閉 Express 伺服器。

*   **`src/server.js`**:
    *   **用途**: 定義和運行後端 API 伺服器 (使用 Express)。
    *   **核心邏輯**:
        *   創建 Express 應用實例 (`const app = express()`)。
        *   使用 `cors()` 中介軟體允許跨域請求。
        *   使用 `express.json()` 中介軟體解析 JSON 請求體。
        *   定義 `GET /api/ping` 路由，返回 `{ message: 'pong' }`。
        *   定義基本的錯誤處理中介軟體。
        *   `startServer()` 函數：封裝 `app.listen(PORT, ...)` 邏輯，啟動伺服器並返回實例。
        *   導出 `startServer` 函數供 `main.js` 使用。

**3. 前端 (`frontend/`)**

*   **`package.json`**:
    *   **用途**: 前端部分的依賴和腳本說明。
    *   **依賴**:
        *   `vue`: 核心 Vue.js 框架。
        *   `chart.js`, `vue-chartjs`: 圖表庫 (階段三用)。
        *   `axios`: 發送 HTTP 請求的工具。
        *   `vite`: 開發工具 (HMR, 快速啟動)。
        *   `@vitejs/plugin-vue`: Vite 的 Vue 插件。
    *   **腳本**:
        *   `"dev": "vite"`: 啟動 Vite 開發伺服器。
        *   `"build": "vite build"`: 打包前端代碼。

*   **`vite.config.js`**:
    *   **用途**: Vite 設定檔。
    *   **配置**: 主要配置了使用 Vue 插件。

*   **`index.html`**:
    *   **用途**: 前端應用的主 HTML 框架。
    *   **核心**: `<div id="app"></div>` 作為 Vue 應用的掛載點；`<script type="module" src="/src/main.js"></script>` 載入 JS 入口。

*   **`src/main.js`**:
    *   **用途**: Vue 應用的入口點。
    *   **邏輯**: 創建 Vue 應用實例，使用 `App.vue` 作為根元件，並掛載到 `#app` div 上。

*   **`src/style.css`**:
    *   **用途**: 全域 CSS 樣式。

*   **`src/App.vue`**:
    *   **用途**: 應用的根 Vue 元件 (單一檔案元件)。
    *   **結構**:
        *   **`<script setup>` (邏輯)**:
            *   使用 `ref` 創建響應式變數 `message`。
            *   使用 `onMounted` 生命週期鉤子，在元件掛載後執行異步函數。
            *   在異步函數中使用 `axios.get` 請求 `/api/ping`。
            *   根據請求結果更新 `message.value`。
        *   **`<template>` (結構)**:
            *   使用 `{{ message }}` 顯示響應式變數的值。
            *   使用 `:style` 動態綁定文字顏色。
        *   **`<style scoped>` (樣式)**: 定義只作用於此元件的樣式。

---

這個備忘錄總結了階段一創建的主要文件及其核心功能和邏輯。 