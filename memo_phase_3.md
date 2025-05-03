# 階段三備忘錄：前端圖表視覺化

## 目標達成

成功使用 Chart.js 和 vue-chartjs，在前端將從後端 API 獲取的 Collatz 序列數據渲染成了折線圖，替換了之前臨時的文本顯示。

## 主要工作

1.  **創建圖表元件 (`frontend/src/components/CollatzChart.vue`)**:
    *   引入 `vue-chartjs` 的 `Line` 元件以及 `Chart.js` 的核心模塊 (ChartJS, Scales, Elements, Title, Tooltip, Legend)。
    *   註冊了 Chart.js 需要的元件 (`ChartJS.register(...)`)。
    *   定義了 `props` 來接收父元件傳遞的 `sequenceData` 陣列。
    *   創建了一個計算屬性 `chartData`，將 `sequenceData` 轉換成 Chart.js 折線圖所需的數據格式 (包含 `labels` 和 `datasets`)。
    *   創建了一個 `ref` `chartOptions`，配置了圖表的響應式、標題、圖例、Y 軸從 0 開始等選項。
    *   在 `<template>` 中，使用 `<Line>` 元件，並通過 `v-if` 判斷只有在 `sequenceData` 有效時才渲染圖表。
    *   使用 `:data` 和 `:options` 將計算好的數據和選項綁定到 `<Line>` 元件。
    *   添加了 `v-else` 情況，在沒有數據時顯示提示文字。
    *   為圖表容器設置了固定高度，以確保圖表能夠正確渲染。

2.  **在主應用中使用圖表元件 (`frontend/src/App.vue`)**:
    *   在 `<script setup>` 中引入了 `CollatzChart.vue` 元件。
    *   在 `<template>` 中：
        *   移除了之前用於顯示文本序列的 `<pre>` 標籤。
        *   添加了 `<CollatzChart :sequence-data="sequenceResult || []" />`，將父元件的 `sequenceResult` (或空陣列) 傳遞給子元件的 `sequence-data` prop。
        *   調整了 `v-if` 邏輯，確保在非加載狀態下顯示圖表元件（或其內部的 "No data" 提示）。
        *   （可選）添加了明確的 "Loading chart..." 提示。

## 驗證結果

*   重新啟動開發環境後，應用界面正常。
*   輸入正整數並點擊計算按鈕後，界面會顯示 "Loading chart..." 提示。
*   計算完成後，界面上顯示了代表 Collatz 序列的折線圖。
*   圖表能夠根據不同的輸入數字正確更新。
*   在沒有數據（初始狀態或計算失敗）時，圖表區域顯示 "No sequence data to display."。

## 下一步

進入階段四：Electron 整合與打包，配置生產環境的加載方式和 `electron-builder`。 