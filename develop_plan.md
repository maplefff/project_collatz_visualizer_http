# Collatz Conjecture 視覺化 App (HTTP API 版) - 開發計畫

## 1. 專案目標

開發一個跨平台桌面應用程式 (使用 Electron 打包)。使用者在前端 (Vue) 輸入一個正整數，請求將發送至後端 (運行在 Electron 主程序中的 Express 伺服器)，由後端計算 Collatz 序列，並將結果陣列返回給前端，前端再使用折線圖視覺化呈現數字變化過程。

## 2. 技術選型

*   **前端框架：** Vue.js (使用 Vite)
*   **前端 HTTP 客戶端：** Axios
*   **後端框架：** Node.js + **Express.js** (運行在 Electron 主程序進程中)
*   **圖表庫：** Chart.js (`vue-chartjs`)
*   **桌面應用打包：** Electron
*   **語言：** JavaScript

## 3. 專案結構

```
collatz_visualizer_http/
├── backend/                # 後端 (Express 伺服器 + Electron 主程序)
│   ├── node_modules/       # 後端依賴 (express)
│   ├── src/                # 後端原始碼
│   │   ├── routes/         # API 路由定義 (例如 collatz.js)
│   │   └── server.js       # Express 應用設定與啟動邏輯
│   ├── main.js             # Electron 主程序入口 (負責啟動 Express & 建立視窗)
│   └── package.json        # 後端依賴管理 (express)
├── frontend/               # 前端 Vue.js 專案
│   ├── dist/               # Vite 建構輸出
│   ├── node_modules/       # 前端依賴
│   ├── public/
│   ├── src/                # 前端原始碼
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── CollatzChart.vue
│   │   ├── services/       # (可選) 存放 API 呼叫邏輯 (例如 api.js)
│   │   ├── App.vue
│   │   └── main.js
│   ├── .gitignore
│   ├── index.html
│   ├── package.json        # 前端依賴管理 (vue, chartjs, axios, vite)
│   └── vite.config.js
├── node_modules/           # 根目錄/Electron 依賴
├── dist-electron/          # Electron Builder 打包輸出
├── .gitignore
├── API_CONTRACT.md         # (建議) API 契約文件
├── package.json            # 根目錄依賴與腳本 (electron, electron-builder, concurrently)
└── README.md
```

## 4. 核心套件選擇 (按目錄劃分)

*   **`frontend/package.json`:**
    *   `vue`, `chart.js`, `vue-chartjs`, **`axios`**
    *   開發依賴: `vite`, `@vitejs/plugin-vue`
*   **`backend/package.json`:**
    *   **`express`**
    *   (可選) `cors` (如果 Vite 開發伺服器需要跨域訪問)
*   **根目錄 `package.json`:**
    *   `electron`, `electron-builder`
    *   開發依賴: `concurrently`

## 5. 開發計畫 (階段性 - HTTP API 版)

1.  **階段一：環境設定與基本伺服器/客戶端**
    *   建立 `collatz_visualizer_http` 根目錄及子目錄 `backend`, `frontend`。
    *   **分別在根目錄、`backend`、`frontend` 執行 `npm init -y`** (或 yarn)。
    *   **分別安裝各目錄的依賴** (根: `electron`, `electron-builder`, `concurrently`; backend: `express`; frontend: `vue`, `chart.js`, `vue-chartjs`, `axios`, `vite`, `@vitejs/plugin-vue`)。 *前端可用 `npm create vite@latest frontend -- --template vue` 初始化。*
    *   **Backend (`backend/src/server.js`)**: 建立基本的 Express 應用，監聽一個端口 (例如 `3001`)。定義一個測試路由 `GET /api/ping` 返回 `{ message: 'pong' }`。
    *   **Backend (`backend/main.js`)**:
        *   引入並**啟動** `backend/src/server.js` 中的 Express 伺服器。**記錄下伺服器實例，以便後續能關閉它。**
        *   建立 `BrowserWindow`，載入前端開發 URL (Vite) 或生產路徑。
        *   監聽 Electron 的 `app.on('will-quit', ...)` 事件，在應用退出前**關閉 Express 伺服器**。
    *   **Frontend (`frontend/src/App.vue`)**: 使用 `axios.get('http://localhost:3001/api/ping')` 請求數據，並顯示收到的 `pong` 訊息。
    *   **根目錄 `package.json` 腳本**:
        *   `install:all`: `"npm install && cd backend && npm install && cd ../frontend && npm install"` (方便一次安裝所有依賴)
        *   `dev:frontend`: `"cd frontend && npm run dev"`
        *   `dev:backend`: `"electron backend/main.js"`
        *   `dev`: `"concurrently \"npm:dev:frontend\" \"npm:dev:backend\""` (注意引號轉義)
        *   `build:frontend`: `"cd frontend && npm run build"`
        *   `build:electron`: `"npm run build:frontend && electron-builder"`
    *   *階段目標:* 運行 `npm run dev`，Electron 啟動，內嵌的 Express 伺服器啟動，前端載入並成功透過 HTTP 從後端獲取到 'pong'。

2.  **階段二：API 實作 (後端 & 前端)**
    *   **Backend (`backend/src/routes/collatz.js`)**: 建立 Express 路由 (例如 `POST /api/collatz`)。從請求體 (`req.body`) 中獲取 `startNumber`。
    *   **Backend (`backend/src/server.js`)**: 在路由處理器中實現 Collatz 計算邏輯，返回 JSON 格式的序列陣列 (`res.json(sequenceArray)`)。記得使用 `express.json()` 中介軟體來解析請求體。
    *   **Frontend (`frontend/src/App.vue`)**: 加入輸入框和按鈕。點擊時，使用 `axios.post('http://localhost:3001/api/collatz', { number: startNumber })` 發送請求，並在 `.then()` 中接收回應數據。
    *   *階段目標:* 前端發送 HTTP POST 請求，後端 Express 處理請求、計算並返回 JSON 數據，前端成功接收。

3.  **階段三：前端圖表視覺化**
    *   **Frontend (`frontend/src/components/CollatzChart.vue`)**: 建立/完善圖表元件，接收序列陣列 prop，渲染圖表。
    *   **Frontend (`frontend/src/App.vue`)**: 將從 Axios 收到的序列陣列傳遞給圖表元件。
    *   *階段目標:* 顯示基於後端 API 返回數據的 Collatz 圖表。

4.  **階段四：Electron 整合與打包**
    *   配置 `backend/main.js` 的 `BrowserWindow` 選項和生產環境 `win.loadFile()` 路徑 (`../frontend/dist/index.html`)。
    *   配置根目錄 `package.json` 的 `electron-builder` 選項，**確保 `backend` 目錄 (包括其 `node_modules` 和 `src`) 以及 `frontend/dist` 都被包含在打包檔中**。
    *   測試 `npm run build:electron` 打包流程。
    *   測試打包後的應用程式，確保內嵌的 Express 伺服器能正常啟動和通信。
    *   *階段目標:* 成功打包生成包含內嵌 HTTP 伺服器的獨立應用程式。

5.  **階段五：測試、優化與完善**
    *   測試邊界情況、大數處理。
    *   優化圖表。
    *   **加強 API 錯誤處理**: 後端 Express 使用錯誤處理中介軟體；前端 `axios` 使用 `.catch()` 處理請求失敗或伺服器錯誤。
    *   加入 API 請求的載入狀態指示。
    *   編寫 `API_CONTRACT.md`，定義 `/api/ping` 和 `/api/collatz` 的細節。
    *   完善 `README.md`。
    *   *階段目標:* 穩定、健壯、使用者體驗良好且文件齊全的應用。

## 6. 關鍵考量點

*   **端口選擇與管理**: 需選擇一個不易衝突的端口供內部 Express 使用。
*   **伺服器生命週期管理**: `main.js` 必須可靠地啟動和關閉 Express 伺服器。
*   **打包配置**: `electron-builder` 需要仔細配置 `files` 和 `asarUnpack` (如果需要) 以包含所有後端文件和依賴。
*   **CORS (跨域資源共享)**: 在開發環境中，Vite 開發伺服器 (例如 `localhost:5173`) 和 Express 伺服器 (例如 `localhost:3001`) 是不同源，可能需要 Express 使用 `cors` 中介軟體允許來自 Vite 源的請求。生產環境載入 `loadFile` 通常沒有此問題。
*   **API 契約**: 維護 `API_CONTRACT.md` 對於這種模式很重要。

## 7. 下一步行動

1.  建立 `collatz_visualizer_http` 根目錄及子目錄。
2.  分別在根、`backend`、`frontend` 初始化 `package.json`。
3.  運行 `npm run install:all` (或手動分別安裝)。
4.  開始建立各目錄下的基礎檔案和配置，特別是 `backend/src/server.js` 和 `backend/main.js` 的伺服器啟動/管理邏輯。 