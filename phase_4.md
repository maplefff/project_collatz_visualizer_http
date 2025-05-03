# 開發計畫 - 階段四：Electron 整合與打包

## 目標

確保應用程式在開發和生產模式下都能正確運行，特別是生產模式下 Electron 需要載入打包後的靜態前端文件，而不是 Vite 開發伺服器。配置 `electron-builder` 以將後端代碼、依賴以及前端建構產物正確打包到最終的可執行應用程式中。

## 執行步驟

1.  **配置 Electron 主程序以處理生產模式 (`backend/main.js`)**:
    *   檢查 `backend/main.js` 中的 `createWindow` 函式，確保它包含判斷開發/生產環境並相應地載入 URL 或文件的邏輯。關鍵部分如下：
      ```javascript
      const { app, BrowserWindow } = require('electron');
      const path = require('path');
      const { startServer } = require('./src/server');

      let mainWindow;
      let expressServerInstance;

      const isDev = !app.isPackaged; // 或 process.env.NODE_ENV !== 'production'

      async function createWindow() {
        // ... (啟動 Express 伺服器)

        mainWindow = new BrowserWindow({ /* ... */ });

        if (isDev) {
          // 開發模式：載入 Vite URL
          console.log('Running in development mode, loading Vite dev server...');
          mainWindow.loadURL('http://localhost:5173'); // 確保端口正確
          mainWindow.webContents.openDevTools();
        } else {
          // 生產模式：載入打包後的前端文件
          console.log('Running in production mode, loading built frontend files...');
          const indexPath = path.join(__dirname, '../frontend/dist/index.html');
          console.log(`Loading file from: ${indexPath}`);
          mainWindow.loadFile(indexPath).catch(err => {
               console.error('Failed to load frontend file:', err);
               // 可以考慮在這裡顯示一個錯誤頁面或退出應用
          });
        }
        // ... (其他視窗邏輯)
      }
      // ... (其他 app 事件監聽器)
      ```
    *   **重要**: 確保 `loadFile` 中的路徑 `path.join(__dirname, '../frontend/dist/index.html')` 相對於 `backend/main.js` 文件是正確的。

2.  **配置 `electron-builder` (`package.json` 根目錄)**:
    *   編輯根目錄的 `package.json`，添加 `build` 區塊來配置 `electron-builder`。
    *   **關鍵**: 需要使用 `files` 屬性明確指定哪些文件和目錄應該被包含在最終的打包文件中。
      ```json
      {
        "name": "collatz-visualizer-http", // 建議使用 kebab-case
        "version": "1.0.0",
        "main": "backend/main.js",
        "scripts": {
           // ... (dev, build:frontend 腳本保持不變)
           "build:electron": "npm run build:frontend && electron-builder"
        },
        "build": { // <-- electron-builder 配置開始
          "appId": "com.example.collatzvisualizer", // 替換為你的應用 ID
          "productName": "Collatz Visualizer", // 應用程式名稱
          "directories": {
            "output": "dist-electron" // 打包輸出目錄
          },
          "files": [
            "**/*", // 預設包含所有文件，但會被下方排除
            "!frontend/**/*", // 排除前端源碼
            "frontend/dist/**/*", // **包含**前端打包後的 dist 目錄
            "backend/**/*", // **包含**後端所有內容 (包括 src, main.js, package.json)
            "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
            "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
            "!**/node_modules/*.d.ts",
            "!**/node_modules/.bin",
            "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
            "!.editorconfig",
            "!**/._*",
            "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.idea,.vscode,__pycache__,thumbs.db,.gitignore,.gitattributes,.flowconfig,.yarn-metadata.json,.yarn-integrity}"
          ],
          "extraResources": [], // 如果有額外的非代碼資源需要複製
          // --- 特定平台的配置 (可選) ---
          "mac": {
            "target": "dmg",
            "icon": "build/icon.icns" // 需要提供圖標文件
          },
          "win": {
            "target": "nsis",
            "icon": "build/icon.ico"
          },
          "linux": {
            "target": "AppImage",
            "icon": "build/icon.png"
          }
        }, // <-- electron-builder 配置結束
        "keywords": [],
        "author": "",
        "license": "ISC",
        "description": "",
        "devDependencies": { /* ... */ },
        "dependencies": {} // 根目錄通常沒有生產依賴
      }
      ```
    *   **說明**: `files` 的配置很重要，它確保了 `backend` 目錄下的所有內容 (包括其 `node_modules`，因為 Express 是生產依賴) 和 `frontend/dist` 被打包。同時排除了一些不必要的文件以減小體積。
    *   你需要創建 `build/` 目錄並在其中放置應用程式圖標 (`icon.icns`, `icon.ico`, `icon.png`)，或者移除/修改 `mac`, `win`, `linux` 下的 `icon` 配置。

3.  **執行打包命令**: 
    *   在根目錄 `collatz_visualizer_http/` 執行：
      ```bash
      npm run build:electron
      ```
    *   這個命令會首先執行 `npm run build:frontend` (確保前端被建構到 `frontend/dist`)，然後執行 `electron-builder` 進行打包。
    *   觀察終端輸出是否有錯誤。

4.  **測試打包後的應用程式**:
    *   打包成功後，在 `dist-electron/` 目錄下找到對應你作業系統的安裝檔或可執行檔 (例如 `.dmg`, `.exe`, `.AppImage`)。
    *   **在沒有運行開發伺服器的情況下**，安裝並啟動打包後的應用程式。
    *   檢查應用是否能正常啟動，內嵌的 Express 伺服器是否在後台啟動 (可以查看應用程式的日誌或進程管理器)。
    *   測試應用程式的核心功能：輸入數字，查看圖表是否正常顯示。
    *   嘗試關閉應用程式，檢查 Express 伺服器進程是否也隨之終止。

## 預期產出

*   `backend/main.js` 能夠正確區分開發和生產環境，並在生產環境載入 `frontend/dist/index.html`。
*   根目錄 `package.json` 包含正確的 `electron-builder` 配置，能夠將所有必要的文件（後端代碼、後端依賴、前端建構產物）打包進去。
*   運行 `npm run build:electron` 能夠成功生成目標平台的可執行應用程式或安裝檔。
*   打包後的應用程式能夠獨立運行，前後端通信正常，功能完整。
*   應用程式關閉時，內嵌的 Express 伺服器也能被正確關閉。 