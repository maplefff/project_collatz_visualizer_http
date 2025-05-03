# 階段四備忘錄：Electron 整合、打包與完善

**完成時間：** [請手動更新]

**主要成果：**

1.  **Electron 生產模式配置：**
    *   修改了 `backend/main.js`，確保在生產環境下使用 `path.join(__dirname, '../frontend/dist/index.html')` 正確載入打包後的前端文件。
    *   修復了 Vite 建構產物在 `file://` 協議下的資源載入問題，透過在 `frontend/vite.config.js` 中設定 `base: './'` 解決了 `net::ERR_FILE_NOT_FOUND` 錯誤。

2.  **Electron Builder 配置與打包：**
    *   在根目錄 `package.json` 中成功添加並配置了 `build` 區塊，定義了 `appId`, `productName`, `directories.output`, `files` 規則（確保後端、後端依賴及前端 `dist` 被包含）以及針對 macOS/Windows/Linux 的圖標和目標格式。
    *   創建了 `build/` 目錄並添加了應用程式圖標（先是 PNG，後續協助生成了 SVG 並指導轉換為 ICNS）。
    *   成功執行 `npm run build:electron` 命令，生成了可在 macOS 上獨立運行的 `.dmg` 應用程式包。
    *   打包後的應用程式經過測試，可以正常啟動、執行核心功能並正確關閉。

3.  **UI/UX 完善 (基於使用者請求)：**
    *   調整了 Electron 視窗的初始大小 (`1000x750`)。
    *   在 `App.vue` 中添加了 Collatz Conjecture 的說明面板，並使用 Flexbox 調整了佈局。
    *   實現了跟隨系統的自動暗黑模式切換：
        *   創建了 `backend/preload.js` 使用 `contextBridge` 和 `ipcRenderer`。
        *   修改了 `backend/main.js` 使用 `nativeTheme` 監聽系統變化並通知前端。
        *   修改了 `App.vue` 接收通知並動態添加 `dark-mode` class。
        *   修改了 `style.css` 和 `CollatzChart.vue` 的樣式，以適配暗黑模式，並解決了相關的顯示問題（如 body margin, chart 容器邊框/背景等）。
    *   修改了前端預設輸入數字為 871。

**遇到的主要問題與解決方案：**

*   **問題：** 打包後應用顯示空白。
    *   **診斷：** 在生產模式下開啟 DevTools，發現 `net::ERR_FILE_NOT_FOUND` 錯誤，無法載入 CSS/JS 資源。
    *   **解決：** 修改 `frontend/vite.config.js`，添加 `base: './'`。
*   **問題：** 暗黑模式下圖表文字顏色不清晰。
    *   **診斷：** `CollatzChart.vue` 未根據暗黑模式狀態調整 Chart.js 的顏色選項。
    *   **解決：** 為 `CollatzChart.vue` 添加 `isDarkMode` prop，使用 `computed` 動態計算 `chartData` 和 `chartOptions` 中的顏色。
*   **問題：** 暗黑模式下圖表周圍出現非預期的淺色框。
    *   **診斷：** 多次嘗試後，發現是 `body` 的預設 `margin` 導致其背景色（暗黑模式下為 `#1e1e1e`）在邊緣可見。
    *   **解決：** 修改全域 `style.css`，將 `body` 的 `margin` 恢復為 `20px`，並確保 `body` 的背景色通過 `@media (prefers-color-scheme: dark)` 與 `App.vue` 的背景色同步。

**總結：** 階段四成功完成了 Electron 應用程式的整合與打包，使其能夠獨立運行。同時根據需求進行了重要的 UI 和功能完善，特別是暗黑模式的支持。打包和樣式調試花費了一些額外時間，但最終版本符合預期。 