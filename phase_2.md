# 開發計畫 - 階段二：API 實作 (後端 & 前端)

## 目標

在後端 Express 伺服器中實現 Collatz 序列的計算邏輯，並提供一個 `POST /api/collatz` 端點。在前端 Vue 應用中添加輸入框和按鈕，允許使用者輸入數字，並透過 Axios 將數字發送給後端 API，接收並（暫時）顯示計算出的序列。

## 執行步驟

1.  **建立後端 Collatz 路由 (`backend/src/routes/collatz.js`)**:
    *   建立 `backend/src/routes/` 目錄。
    *   建立 `backend/src/routes/collatz.js` 文件，內容類似：
      ```javascript
      const express = require('express');
      const router = express.Router();

      // Collatz 計算函式
      function calculateCollatzSequence(n) {
        if (n <= 0 || !Number.isInteger(n)) {
          throw new Error('Input must be a positive integer.');
        }
        const sequence = [n];
        while (n !== 1) {
          if (n % 2 === 0) {
            n = n / 2;
          } else {
            // 注意：對於非常大的數，這裡可能溢出 JavaScript 的安全整數範圍
            n = 3 * n + 1;
          }
          sequence.push(n);
          // 可以加入一個循環上限以防止潛在的無限循環（儘管理論上不應該發生）
          if (sequence.length > 10000) { // 範例上限
             throw new Error('Sequence length limit exceeded.');
          }
        }
        return sequence;
      }

      // 定義 POST /api/collatz 路由
      router.post('/', (req, res, next) => {
        try {
          const startNumber = req.body.number; // 從請求體獲取數字
          if (startNumber === undefined) {
             return res.status(400).json({ error: 'Missing "number" in request body' });
          }
          const number = parseInt(startNumber, 10);

          if (isNaN(number)) {
            return res.status(400).json({ error: 'Input must be a valid number' });
          }

          const sequence = calculateCollatzSequence(number);
          res.json({ sequence }); // 返回計算結果
        } catch (error) {
          // 將錯誤傳遞給 Express 的錯誤處理中介軟體
          next(error);
        }
      });

      module.exports = router;
      ```

2.  **在後端主伺服器中掛載路由 (`backend/src/server.js`)**:
    *   修改 `backend/src/server.js`，引入並使用 `collatz.js` 路由：
      ```javascript
      const express = require('express');
      // const cors = require('cors');
      const collatzRoutes = require('./routes/collatz'); // <--- 引入路由
      const app = express();
      const PORT = 3001;

      // app.use(cors());
      app.use(express.json());

      // --- API 路由 ---
      app.get('/api/ping', (req, res) => {
        res.json({ message: 'pong' });
      });
      app.use('/api/collatz', collatzRoutes); // <--- 掛載 Collatz 路由到 /api/collatz 路徑

      // --- 錯誤處理 ---
      app.use((err, req, res, next) => {
        console.error(`[${new Date().toISOString()}] ${err.message}`);
        // 可以根據錯誤類型返回不同的狀態碼
        if (err.message.includes('positive integer') || err.message.includes('valid number')) {
            res.status(400).json({ error: err.message });
        } else if (err.message.includes('limit exceeded')) {
             res.status(413).json({ error: err.message }); // Payload Too Large
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
      });

      function startServer() {
        // ... (啟動伺服器邏輯保持不變)
        return new Promise((resolve, reject) => { /* ... */ });
      }

      module.exports = { startServer };
      ```

3.  **修改前端應用以發送請求 (`frontend/src/App.vue`)**:
    *   修改 `frontend/src/App.vue`，添加輸入框、按鈕和處理函數：
      ```vue
      <script setup>
      import { ref } from 'vue';
      import axios from 'axios';

      const startNumberInput = ref(6);
      const sequenceResult = ref(null);
      const isLoading = ref(false);
      const errorMessage = ref(null);

      const calculateCollatz = async () => {
        if (!startNumberInput.value || startNumberInput.value <= 0) {
          errorMessage.value = 'Please enter a positive integer.';
          sequenceResult.value = null;
          return;
        }

        isLoading.value = true;
        errorMessage.value = null;
        sequenceResult.value = null;

        try {
          const response = await axios.post('http://localhost:3001/api/collatz', {
            number: parseInt(startNumberInput.value, 10)
          });
          sequenceResult.value = response.data.sequence;
        } catch (error) {
          console.error('Error calculating Collatz:', error);
          if (error.response) {
            // 後端返回了錯誤訊息
            errorMessage.value = error.response.data.error || 'An error occurred on the server.';
          } else if (error.request) {
            // 請求已發出，但沒有收到回應
            errorMessage.value = 'Could not connect to the backend server.';
          } else {
            // 設置請求時發生了錯誤
            errorMessage.value = 'An error occurred while setting up the request.';
          }
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

          <div v-if="sequenceResult" style="margin-top: 20px;">
            <h2>Result Sequence:</h2>
            <!-- 暫時以文字顯示，下一階段替換為圖表 -->
            <pre>{{ sequenceResult.join(', ') }}</pre>
          </div>

          <!-- 圖表將在下一階段添加 -->
          <div v-if="sequenceResult">
            <h2>Chart Placeholder</h2>
            <p>Chart will be rendered here in Phase 3.</p>
          </div>
        </div>
      </template>

      <style scoped>
      label {
        margin-right: 5px;
      }
      input[type="number"] {
        width: 80px;
        margin-right: 10px;
      }
      button:disabled {
        cursor: not-allowed;
      }
      pre {
         background-color: #f4f4f4;
         padding: 10px;
         border-radius: 4px;
         word-wrap: break-word;
      }
      </style>
      ```

4.  **重啟並測試**:
    *   如果 `npm run dev` 正在運行，停止它 (Ctrl+C)。
    *   重新運行 `npm run dev` (在根目錄)。
    *   在 Electron 應用的輸入框中輸入一個正整數 (例如 6 或 7)。
    *   點擊 "Calculate & Visualize" 按鈕。
    *   檢查是否在下方看到了計算出的數字序列（以文字形式）。
    *   測試輸入無效值 (例如 0, -1, 或非數字)，檢查是否顯示錯誤訊息。

## 預期產出

*   後端 Express 伺服器新增 `/api/collatz` 端點，能夠接收 POST 請求，執行 Collatz 計算，並返回 JSON 格式的序列陣列或錯誤訊息。
*   前端 Vue 應用包含輸入框和按鈕。
*   點擊按鈕後，前端能使用 `axios` 將輸入數字發送給後端 `/api/collatz` 端點。
*   前端能接收後端返回的序列陣列或錯誤訊息，並將其顯示在頁面上。
*   基本的加載狀態 (按鈕禁用) 和錯誤顯示功能正常工作。 