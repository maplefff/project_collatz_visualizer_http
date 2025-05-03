# 階段二備忘錄：API 實作 (後端 & 前端)

## 目標達成

成功在後端實現了 Collatz 序列計算的 API 端點 (`POST /api/collatz`)，並在前端實現了調用此 API 的功能，能夠將計算結果（序列）顯示在界面上。

## 主要工作

1.  **後端 (Backend)**:
    *   創建了路由文件 `backend/src/routes/collatz.js`。
    *   在 `collatz.js` 中：
        *   實現了 `calculateCollatzSequence(n)` 函數，包含對正整數輸入的驗證、計算邏輯、最大步驟數限制以及對潛在數字溢出的檢查。
        *   錯誤處理：在計算或驗證失敗時，拋出帶有描述性訊息和對應 HTTP 狀態碼 (400 或 413) 的 Error 物件。
        *   定義了處理 `POST /` (相對於掛載點) 的路由處理器，從 `req.body.number` 獲取輸入，調用計算函數，並在成功時返回 `{ sequence: [...] }` 的 JSON。
        *   使用 `try...catch` 包裹路由處理器邏輯，並在捕獲錯誤時調用 `next(error)` 將錯誤傳遞給後續處理。
    *   在主伺服器文件 `backend/src/server.js` 中：
        *   引入 `collatzRoutes` 模組。
        *   使用 `app.use('/api/collatz', collatzRoutes)` 將路由掛載到正確的路徑。
        *   實現了更完善的 Express 錯誤處理中介軟體，能夠捕獲來自路由的錯誤（包括我們自定義的狀態碼和訊息），記錄錯誤到控制台，並向客戶端返回標準化的 JSON 錯誤回應。

2.  **前端 (Frontend)**:
    *   修改了 `frontend/src/App.vue`：
        *   添加了必要的狀態變數 (`startNumberInput`, `sequenceResult`, `isLoading`, `errorMessage`)。
        *   實現了 `calculateCollatz` 異步函數：
            *   包含客戶端基本輸入驗證。
            *   管理 `isLoading` 狀態，用於禁用按鈕和（未來）顯示加載提示。
            *   清空舊的結果和錯誤訊息。
            *   使用 `axios.post('/api/collatz', { number: ... })` 向後端發送 POST 請求。
            *   處理成功的 axios 回應，將 `response.data.sequence` 存儲到 `sequenceResult`。
            *   處理 axios 請求失敗的情況，嘗試從 `error.response.data.error.message` 提取後端返回的錯誤訊息，或顯示通用的網絡/請求錯誤。
            *   使用 `finally` 確保 `isLoading` 狀態被重置。
        *   更新了 `<template>`：
            *   添加了 `label`, `input type="number"` 和 `button` 用於用戶輸入和觸發計算。
            *   使用 `v-if` 條件渲染來顯示 `errorMessage` 或 `sequenceResult` (暫時使用 `<pre>` 標籤顯示文本序列)。
            *   按鈕的禁用狀態 (`:disabled`) 與 `isLoading` 綁定。
        *   添加了一些基本的 CSS 樣式。

## 驗證結果

*   重新啟動開發環境後，Electron 應用正常顯示界面。
*   在前端輸入框輸入正整數並點擊按鈕，後端成功計算並返回序列，前端正確接收並顯示了文本格式的序列。
*   前端能夠正確處理加載狀態（按鈕禁用）。
*   對於無效輸入（如 0, 非數字），前端和/或後端能夠捕獲錯誤，並在前端顯示相應的錯誤訊息。

## 下一步

進入階段三：前端圖表視覺化，使用 Chart.js 將結果序列渲染成折線圖。 