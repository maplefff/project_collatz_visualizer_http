# 開發計畫 - 階段五：測試、優化與完善

## 目標

對應用程式進行全面的測試，處理邊界情況，優化性能和使用者體驗，加強錯誤處理機制，並完成相關的文檔（API 契約和 README）。

## 執行步驟

1.  **測試邊界情況與大數處理**:
    *   **輸入 1**: 驗證序列是否為 `[1]`，圖表是否正確顯示單個點。
    *   **輸入 0, -1, 非整數**: 驗證前端是否有恰當的提示，後端 API 是否返回 400 錯誤。
    *   **輸入較大數字**: 測試例如 27，觀察序列長度和數值大小。注意 JavaScript 的 `Number.MAX_SAFE_INTEGER` 限制 (約 9e15)，如果計算過程中超出此範圍，結果可能不準確。考慮：
        *   在後端增加輸入上限。
        *   或者引入 `BigInt` 進行計算（會增加複雜性）。
        *   在前端提示使用者輸入過大可能導致計算緩慢或不準確。
    *   **測試空輸入**: 確保點擊按鈕時有提示。

2.  **優化圖表顯示與交互**:
    *   **長序列**: 對於非常長的序列 (例如輸入 27)，觀察圖表的可讀性。可以考慮：
        *   調整 `Chart.js` 選項，例如減少點的顯示、優化 Tooltip。
        *   限制圖表顯示的點數上限？（可能影響完整性）
    *   **圖表樣式**: 根據需要調整顏色、線條樣式、標題、圖例等。
    *   **響應式**: 確保圖表在視窗大小變化時能正常縮放。

3.  **加強 API 錯誤處理**: 
    *   **後端 (`backend/src/server.js`)**: 檢查錯誤處理中介軟體，確保能捕捉不同類型的錯誤 (計算錯誤、請求格式錯誤) 並返回合適的 HTTP 狀態碼和清晰的 JSON 錯誤訊息。
    *   **前端 (`frontend/src/App.vue`)**: 檢查 `axios` 的 `.catch()` 塊，確保能處理不同類型的錯誤 (網路錯誤、伺服器 4xx/5xx 錯誤)，並向使用者顯示友好的錯誤提示，而不是直接暴露技術細節。

4.  **加入載入狀態指示**: 
    *   **前端 (`frontend/src/App.vue`)**: 目前已透過 `:disabled="isLoading"` 禁用按鈕。可以考慮加入更明顯的視覺提示，例如一個旋轉的圖標或文字提示 "Calculating..."。
      ```vue
      <template>
        <div>
          <!-- ... -->
          <button @click="calculateCollatz" :disabled="isLoading">
            <span v-if="isLoading">Calculating...</span>
            <span v-else>Calculate & Visualize</span>
          </button>
          <!-- ... -->
          <div v-if="isLoading" style="margin-top: 10px;">
             Loading indicator... (e.g., a spinner component)
          </div>
          <!-- ... 圖表或結果 ... -->
        </div>
      </template>
      ```

5.  **編寫 API 契約文件 (`API_CONTRACT.md`)**:
    *   建立 `API_CONTRACT.md` 文件。
    *   詳細描述每個 API 端點：
        *   **`GET /api/ping`**: 
            *   方法: GET
            *   描述: 測試後端服務是否可用。
            *   請求參數: 無
            *   成功回應 (200 OK): `{ "message": "pong" }`
            *   錯誤回應: 無特定應用錯誤，可能為 5xx 伺服器錯誤。
        *   **`POST /api/collatz`**: 
            *   方法: POST
            *   描述: 計算給定起始數字的 Collatz 序列。
            *   請求體 (JSON): `{ "number": <positive_integer> }`
            *   成功回應 (200 OK): `{ "sequence": [<integer>, <integer>, ...] }`
            *   錯誤回應:
                *   400 Bad Request: `{ "error": "Missing 'number' in request body" }`
                *   400 Bad Request: `{ "error": "Input must be a valid number" }`
                *   400 Bad Request: `{ "error": "Input must be a positive integer." }`
                *   413 Payload Too Large: `{ "error": "Sequence length limit exceeded." }` (如果後端設置了上限)
                *   500 Internal Server Error: `{ "error": "Internal Server Error" }`

6.  **完善 README 文件 (`README.md`)**:
    *   建立或更新根目錄的 `README.md` 文件。
    *   包含內容：
        *   專案簡介。
        *   技術棧列表。
        *   如何設置開發環境 (克隆倉庫、安裝依賴 - `npm run install:all`)。
        *   如何運行開發模式 (`npm run dev`)。
        *   如何建構和打包應用程式 (`npm run build:electron`)。
        *   (可選) 專案結構說明。
        *   (可選) 已知問題或未來改進方向。

7.  **代碼清理與審查 (可選)**:
    *   移除不必要的 `console.log`。
    *   檢查代碼風格一致性 (可以使用 Prettier, ESLint 等工具)。
    *   確保變數和函式命名清晰。

## 預期產出

*   應用程式對各種輸入和邊界情況的處理更加健壯。
*   API 的錯誤處理機制完善，前端能提供清晰的錯誤回饋。
*   使用者體驗得到改善 (例如，加入明確的加載指示)。
*   `API_CONTRACT.md` 文件清晰地定義了前後端交互的接口。
*   `README.md` 文件提供了足夠的信息，讓其他人能夠理解、設置、運行和建構此專案。
*   應用程式準備好進行最終的測試和可能的發布。 