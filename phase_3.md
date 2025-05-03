# 開發計畫 - 階段三：前端圖表視覺化

## 目標

利用 `vue-chartjs` 和 `Chart.js`，將從後端 API 獲取的 Collatz 序列數據渲染成一個折線圖，替換掉之前階段用於臨時顯示序列的文字區域。

## 執行步驟

1.  **建立圖表元件 (`frontend/src/components/CollatzChart.vue`)**:
    *   建立 `frontend/src/components/CollatzChart.vue` 文件，內容類似：
      ```vue
      <script setup>
      import { computed, watch } from 'vue';
      import { Line } from 'vue-chartjs';
      import {
        Chart as ChartJS,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
      } from 'chart.js';

      // 註冊 Chart.js 需要的元件
      ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
      );

      // 定義 props
      const props = defineProps({
        sequenceData: {
          type: Array,
          required: true,
          default: () => []
        }
      });

      // 計算屬性，用於生成 Chart.js 需要的數據格式
      const chartData = computed(() => ({
        labels: props.sequenceData.map((_, index) => `Step ${index + 1}`), // X 軸標籤 (步驟)
        datasets: [
          {
            label: 'Collatz Sequence',
            backgroundColor: '#f87979',
            borderColor: '#f87979', // 可以調整顏色
            data: props.sequenceData, // Y 軸數據 (序列值)
            fill: false,
            tension: 0.1 // 線條平滑度
          }
        ]
      }));

      // Chart.js 選項配置
      const chartOptions = ref({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          },
          title: {
            display: true,
            text: 'Collatz Sequence Visualization'
          }
        },
        scales: {
          y: {
            beginAtZero: true // 可以根據需要調整 Y 軸是否從 0 開始
          }
        }
      });

      // 監視 props.sequenceData 的變化，以便在數據更新時可能需要重新配置選項
      // (對於這個簡單的圖表示例，可能不是嚴格必需的，但作為良好實踐)
      watch(() => props.sequenceData, (newData) => {
        // 如果需要根據新數據動態調整選項，可以在這裡添加邏輯
        // 例如，如果數值範圍變化很大，可能需要調整 Y 軸
        console.log('Sequence data changed for chart:', newData);
      }, { deep: true });

      </script>

      <template>
        <div style="height: 400px; position: relative;"> <!-- 必須給容器設定高度 -->
          <Line
            v-if="sequenceData && sequenceData.length > 0"
            :data="chartData"
            :options="chartOptions"
          />
           <p v-else>No data to display chart.</p>
        </div>
      </template>

      <style scoped>
      /* 可以為圖表容器添加樣式 */
      </style>
      ```
      *注意：需要從 `vue` 導入 `ref`，並且在 `chartOptions` 前使用 `ref`。修正上面的代碼片段。*
      ```vue
      <script setup>
      import { ref, computed, watch } from 'vue'; // <--- 導入 ref
      import { Line } from 'vue-chartjs';
      import { /* ... Chart.js imports ... */ } from 'chart.js';

      ChartJS.register(/* ... */);

      const props = defineProps({ /* ... */ });

      const chartData = computed(() => ({ /* ... */ }));

      const chartOptions = ref({ /* ... */ }); // <--- 使用 ref

      watch(() => props.sequenceData, (newData) => { /* ... */ }, { deep: true });
      </script>
      <template>
        <div style="height: 400px; position: relative;">
          <Line
            v-if="sequenceData && sequenceData.length > 0"
            :data="chartData"
            :options="chartOptions"
          />
          <p v-else>No data to display chart.</p>
        </div>
      </template>
      ```

2.  **在主應用中使用圖表元件 (`frontend/src/App.vue`)**:
    *   修改 `frontend/src/App.vue`，引入並使用 `CollatzChart.vue`，並將從 API 獲取的 `sequenceResult` 傳遞給它。
    *   移除之前用於顯示文字序列的 `<pre>` 標籤和 "Chart Placeholder" 部分。
      ```vue
      <script setup>
      import { ref } from 'vue';
      import axios from 'axios';
      import CollatzChart from './components/CollatzChart.vue'; // <--- 引入圖表元件

      const startNumberInput = ref(6);
      const sequenceResult = ref(null);
      const isLoading = ref(false);
      const errorMessage = ref(null);

      const calculateCollatz = async () => {
        // ... (calculateCollatz 邏輯保持不變)
        if (!startNumberInput.value || startNumberInput.value <= 0) { /* ... */ return; }
        isLoading.value = true;
        errorMessage.value = null;
        sequenceResult.value = null; // 清空舊結果
        try {
          const response = await axios.post('http://localhost:3001/api/collatz', {
            number: parseInt(startNumberInput.value, 10)
          });
          sequenceResult.value = response.data.sequence;
        } catch (error) {
           // ... (錯誤處理不變)
          if (error.response) { errorMessage.value = /* ... */; } else if (error.request) { errorMessage.value = /* ... */; } else { errorMessage.value = /* ... */; }
        } finally {
          isLoading.value = false;
        }
      };
      </script>

      <template>
        <div>
          <h1>Collatz Conjecture Visualizer</h1>

          <div>
             <label for="startNumber">Enter a positive integer: </label>
             <input type="number" id="startNumber" v-model.number="startNumberInput" min="1" />
             <button @click="calculateCollatz" :disabled="isLoading">
               {{ isLoading ? 'Calculating...' : 'Calculate & Visualize' }}
             </button>
          </div>

          <div v-if="errorMessage" style="color: red; margin-top: 10px;">
            Error: {{ errorMessage }}
          </div>

          <!-- 使用圖表元件替換之前的文字顯示 -->
          <div v-if="!isLoading && sequenceResult" style="margin-top: 20px;">
            <CollatzChart :sequence-data="sequenceResult" />
          </div>
          <div v-else-if="!isLoading && !errorMessage">
             <!-- 可以加一個提示，讓用戶輸入數字 -->
             <p style="margin-top: 20px;">Enter a number and click calculate to see the visualization.</p>
          </div>
        </div>
      </template>

      <style scoped>
      /* ... (樣式可以保持不變或調整) ... */
      label { margin-right: 5px; }
      input[type="number"] { width: 80px; margin-right: 10px; }
      button:disabled { cursor: not-allowed; }
      </style>
      ```

3.  **重啟並測試**:
    *   如果 `npm run dev` 正在運行，停止它。
    *   重新運行 `npm run dev`。
    *   輸入一個數字 (例如 6, 7, 27) 並點擊按鈕。
    *   檢查是否顯示了一個包含 Collatz 序列的折線圖。
    *   確認在沒有數據或計算中時，圖表區域的顯示是合理的（例如顯示提示信息或不顯示）。

## 預期產出

*   `CollatzChart.vue` 元件能夠接收序列數據並正確渲染 `Chart.js` 折線圖。
*   `App.vue` 能夠將從 API 獲取的數據成功傳遞給 `CollatzChart.vue`。
*   應用介面上，序列的文字顯示被替換為互動式的折線圖。
*   圖表能夠響應不同的輸入數據並正確更新。 