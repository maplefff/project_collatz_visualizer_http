# 開發計畫 - 階段一：環境設定與基本伺服器/客戶端

## 目標

建立專案基礎結構，安裝所有必要依賴，創建一個基本的 Express 後端伺服器和 Vue 前端應用，並讓它們能夠透過 HTTP 進行最基本的通信 (`/api/ping`)。最終目標是能夠運行 `npm run dev` 啟動應用，並在 Electron 視窗中看到前端成功從後端獲取的 "pong" 訊息。

## 執行步驟

1.  **確認目錄結構**:
    *   確保根目錄 `collatz_visualizer_http/` 存在。
    *   確保 `collatz_visualizer_http/backend/` 和 `collatz_visualizer_http/frontend/` 子目錄存在。
    *   如果尚未建立，請執行：`mkdir -p collatz_visualizer_http/backend collatz_visualizer_http/frontend`

2.  **初始化 `package.json`**:
    *   確保根目錄、`backend` 目錄、`frontend` 目錄下都存在 `package.json` 文件。
    *   如果尚未初始化，請在各目錄分別執行：
        *   `cd collatz_visualizer_http && npm init -y`
        *   `cd collatz_visualizer_http/backend && npm init -y`
        *   `cd collatz_visualizer_http/frontend && npm init -y`

3.  **安裝依賴**:
    *   **根目錄依賴 (Electron 相關)**:
        ```bash
        # 在 collatz_visualizer_http/ 目錄下執行
        npm install electron electron-builder concurrently --save-dev
        ```
    *   **後端依賴 (Express)**:
        ```bash
        # 在 collatz_visualizer_http/backend/ 目錄下執行
        npm install express
        # (可選) 如果需要處理開發時 CORS 問題
        # npm install cors
        ```
    *   **前端依賴 (Vue, Chart.js, Axios, Vite)**:
        ```bash
        # 在 collatz_visualizer_http/frontend/ 目錄下執行
        # 核心依賴
        npm install vue chart.js vue-chartjs axios
        # 開發依賴
        npm install vite @vitejs/plugin-vue --save-dev
        ```
        *替代方案: 可以直接使用 Vite 初始化前端項目：`npm create vite@latest frontend -- --template vue`，然後再 `cd frontend` 並安裝 `chart.js vue-chartjs axios`。*

4.  **建立後端基本 Express 伺服器 (`backend/src/server.js`)**:
    *   建立 `backend/src/` 目錄。
    *   建立 `backend/src/server.js` 文件，內容類似：
      ```javascript
      const express = require('express');
      // const cors = require('cors'); // 如果安裝了 cors
      const app = express();
      const PORT = 3001; // 或選擇其他端口

      // app.use(cors()); // 如果需要允許 Vite 開發伺服器的跨域請求
      app.use(express.json()); // 中介軟體，用於解析 JSON 請求體

      // --- API 路由 ---
      app.get('/api/ping', (req, res) => {
        res.json({ message: 'pong' });
      });

      // --- 錯誤處理 (可稍後完善) ---
      app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
      });

      // --- 啟動伺服器函式 ---
      // 將啟動邏輯封裝，以便 main.js 調用
      function startServer() {
        return new Promise((resolve, reject) => {
          const server = app.listen(PORT, () => {
            console.log(`Backend server listening on port ${PORT}`);
            resolve(server); // 返回伺服器實例，以便關閉
          });
          server.on('error', (error) => {
            console.error('Failed to start server:', error);
            reject(error);
          });
        });
      }

      module.exports = { startServer }; // 導出啟動函式
      ```

5.  **建立 Electron 主程序入口 (`backend/main.js`)**:
    *   建立 `backend/main.js` 文件，內容類似：
      ```javascript
      const { app, BrowserWindow } = require('electron');
      const path = require('path');
      const { startServer } = require('./src/server'); // 引入後端伺服器啟動函式

      let mainWindow;
      let expressServerInstance; // 用於儲存伺服器實例

      const isDev = !app.isPackaged; // 判斷是否為開發環境

      async function createWindow() {
        // 啟動 Express 伺服器
        try {
          expressServerInstance = await startServer();
          console.log('Express server started successfully.');
        } catch (error) {
          console.error('Failed to start Express server, quitting app.', error);
          app.quit();
          return;
        }

        // 建立瀏覽器視窗
        mainWindow = new BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            // preload: path.join(__dirname, 'preload.js'), // 此項目 HTTP 模式下非必需
            nodeIntegration: false, // 推薦關閉
            contextIsolation: true, // 推薦開啟
          },
        });

        // 載入前端頁面
        if (isDev) {
          // 開發模式：載入 Vite 開發伺服器 URL (通常是 localhost:5173)
          // 確保 Vite 服務先啟動
          mainWindow.loadURL('http://localhost:5173'); // Vite 預設端口，根據實際情況調整
          mainWindow.webContents.openDevTools(); // 開啟開發者工具
        } else {
          // 生產模式：載入打包後的前端文件
          mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
        }

        mainWindow.on('closed', () => {
          mainWindow = null;
        });
      }

      app.whenReady().then(createWindow);

      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit();
        }
      });

      // 在應用退出前關閉 Express 伺服器
      app.on('will-quit', () => {
        if (expressServerInstance) {
          console.log('Closing Express server...');
          expressServerInstance.close(() => {
            console.log('Express server closed.');
          });
        }
      });

      app.on('activate', () => {
        if (mainWindow === null) {
          createWindow();
        }
      });
      ```

6.  **建立基本前端應用 (`frontend/`)**:
    *   **`frontend/vite.config.js`**: 確保基本配置存在 (通常由 `create vite` 自動生成)。
    *   **`frontend/index.html`**: Vite 的入口 HTML 文件。
    *   **`frontend/src/main.js`**: Vue 應用程式的入口點，創建 Vue 實例。
    *   **`frontend/src/App.vue`**: 根元件，在這裡測試 API 調用。
      ```vue
      <script setup>
      import { ref, onMounted } from 'vue';
      import axios from 'axios';

      const message = ref('Loading...');

      onMounted(async () => {
        try {
          // 注意：URL 中的端口需要與 backend/src/server.js 中設定的一致
          const response = await axios.get('http://localhost:3001/api/ping');
          message.value = response.data.message;
        } catch (error) {
          console.error('Error fetching ping:', error);
          message.value = 'Failed to connect to backend';
        }
      });
      </script>

      <template>
        <div>
          <h1>Collatz Visualizer</h1>
          <p>Backend status: {{ message }}</p>
        </div>
      </template>

      <style scoped>
      /* 添加一些基本樣式 */
      </style>
      ```
    *   **`frontend/src/components/`**: 建立此目錄，暫時留空。

7.  **配置根目錄 `package.json` 腳本**:
    *   編輯根目錄的 `package.json`，添加或修改 `scripts` 部分：
      ```json
      {
        "name": "collatz_visualizer_http",
        "version": "1.0.0",
        "main": "backend/main.js", // 指定 Electron 的入口點
        "scripts": {
          "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
          "dev:frontend": "cd frontend && npm run dev",
          "dev:backend": "electron backend/main.js",
          "dev": "concurrently "npm:dev:frontend" "npm:dev:backend"",
          "build:frontend": "cd frontend && npm run build",
          "build:electron": "npm run build:frontend && electron-builder",
          "test": "echo "Error: no test specified" && exit 1"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "description": "",
        "devDependencies": {
          "concurrently": "^8.x.x", // 版本號可能不同
          "electron": "^28.x.x",
          "electron-builder": "^24.x.x"
        }
      }
      ```
      *注意：請確保 `concurrently`, `electron`, `electron-builder` 的版本號與您實際安裝的匹配。 `main` 欄位應指向 `backend/main.js`。*

8.  **運行測試**:
    *   打開兩個終端。
    *   終端一：`cd collatz_visualizer_http/frontend && npm run dev` (啟動 Vite)
    *   終端二：`cd collatz_visualizer_http && npm run dev:backend` (啟動 Electron)
    *   或者，在根目錄 `collatz_visualizer_http/` 運行 `npm run dev` (如果 `concurrently` 安裝成功)。
    *   檢查 Electron 視窗是否打開，並且是否顯示 "Backend status: pong"。檢查終端是否有錯誤訊息。

## 預期產出

*   所有依賴安裝完成。
*   `backend/src/server.js` 能夠獨立運行並響應 `/api/ping` 請求。
*   `backend/main.js` 能夠啟動 Express 伺服器並打開 Electron 視窗。
*   `frontend/src/App.vue` 能夠在掛載後透過 `axios` 請求 `/api/ping` 並顯示結果。
*   運行 `npm run dev` 可以成功啟動整個應用程式，並看到前端與後端成功通信的跡象。 