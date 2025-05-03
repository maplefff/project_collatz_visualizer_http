<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import CollatzChart from './components/CollatzChart.vue';

// const message = ref('Loading...'); // 可以移除或保留 ping 測試

// 新增狀態變數
const startNumberInput = ref(871); // Change default input value to 871
const sequenceResult = ref(null); // 儲存後端返回的序列
const isLoading = ref(false); // 控制加載狀態
const errorMessage = ref(null); // 儲存錯誤訊息
const isDarkMode = ref(false); // State for dark mode
let cleanupThemeListener = null; // To store the cleanup function

// Ping 測試 (可以保留或移除)
// onMounted(async () => {
//   try {
//     const response = await axios.get('http://localhost:3001/api/ping');
//     message.value = response.data.message;
//   } catch (error) {
//     console.error('Error fetching ping:', error);
//     if (error.code === 'ECONNREFUSED') {
//       message.value = 'Connection refused. Is the backend server running on port 3001?';
//     } else {
//        message.value = `Failed to connect to backend: ${error.message}`;
//     }
//   }
// });

// 計算 Collatz 序列的函數
const calculateCollatz = async () => {
  // 1. 前端基本驗證
  if (!startNumberInput.value || startNumberInput.value <= 0 || !Number.isInteger(startNumberInput.value)) {
    errorMessage.value = 'Please enter a positive integer.';
    sequenceResult.value = null; // 清空之前的結果
    return;
  }

  // 2. 設置加載狀態，清除舊錯誤/結果
  isLoading.value = true;
  errorMessage.value = null;
  sequenceResult.value = null;

  try {
    // 3. 發送 POST 請求到後端
    const response = await axios.post('http://localhost:3001/api/collatz', {
      number: startNumberInput.value // 發送 number 字段，值為輸入框的數字
    });
    // 4. 處理成功回應
    sequenceResult.value = response.data.sequence;
  } catch (error) {
    // 5. 處理錯誤
    console.error('Error calculating Collatz:', error);
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      // 嘗試獲取後端 JSON 回應中的錯誤訊息
      errorMessage.value = error.response.data.error.message;
    } else if (error.request) {
      // 請求已發出但未收到回應
      errorMessage.value = 'No response from backend server. Is it running?';
    } else {
      // 設置請求時觸發了錯誤
      errorMessage.value = `Error setting up request: ${error.message}`;
    }
  } finally {
    // 6. 無論成功或失敗，都要結束加載狀態
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log('App component mounted, checking for electronAPI');
  if (window.electronAPI && typeof window.electronAPI.onThemeUpdate === 'function') {
    console.log('electronAPI found, registering theme update listener.');
    cleanupThemeListener = window.electronAPI.onThemeUpdate((shouldUseDark) => {
      console.log('Theme update received in App.vue:', shouldUseDark);
      isDarkMode.value = shouldUseDark;
    });
  } else {
      console.warn('window.electronAPI.onThemeUpdate not found. Running in browser or preload failed?');
      // Optional: Check prefers-color-scheme for non-electron environments or as fallback
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode.value = prefersDark;
      console.log('Fallback theme check (prefers-color-scheme): ', isDarkMode.value);
  }
});

onUnmounted(() => {
  // Clean up the listener when the component is unmounted
  if (cleanupThemeListener) {
    console.log('Cleaning up theme listener in App.vue');
    cleanupThemeListener();
  }
});
</script>

<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="main-content">
        <h1>Collatz Conjecture Visualizer</h1>
        <!-- 可以保留或移除 Ping 狀態顯示 -->
        <!-- <p>Backend status: <span :style="{ color: message === 'pong' ? 'green' : 'red' }">{{ message }}</span></p> -->

        <hr />

        <div>
        <label for="startNumber">Enter a positive integer: </label>
        <input type="number" id="startNumber" v-model.number="startNumberInput" min="1" step="1" />
        <button @click="calculateCollatz" :disabled="isLoading">
            {{ isLoading ? 'Calculating...' : 'Calculate & Visualize' }}
        </button>
        </div>

        <!-- 顯示錯誤訊息 -->
        <div v-if="errorMessage" class="error-message">
        Error: {{ errorMessage }}
        </div>

        <!-- 使用圖表元件顯示結果 -->
        <div v-if="!isLoading" class="chart-container">
          <!-- 將 sequenceResult 傳遞給子元件的 sequence-data prop -->
          <!-- 如果 sequenceResult 為 null 或空陣列，圖表元件內部會處理顯示提示 -->
          <CollatzChart :sequence-data="sequenceResult || []" :is-dark-mode="isDarkMode" />
        </div>
        <!-- 可以添加一個明確的加載提示 -->
        <div v-if="isLoading" class="loading-indicator">
        <p>Loading chart...</p>
        </div>
    </div>

    <div class="info-panel">
      <h2>What is the Collatz Conjecture?</h2>
      <p>
        The Collatz conjecture is an unsolved conjecture in mathematics named after Lothar Collatz, who first proposed it in 1937.
        It states that if you pick any positive integer n, and repeatedly apply the following operations:
      </p>
      <ul>
        <li>If n is even, divide it by 2 (n → n/2).</li>
        <li>If n is odd, multiply it by 3 and add 1 (n → 3n + 1).</li>
      </ul>
      <p>
        The conjecture is that no matter what number you start with, the sequence will always eventually reach 1.
      </p>
      <p>
        This visualizer allows you to enter a positive integer and see the sequence generated by these rules.
      </p>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  gap: 20px; /* Add some space between main content and info panel */
  padding: 20px;
  min-height: calc(100vh - 40px); /* Ensure container fills height */
  box-sizing: border-box;
}

.main-content {
  flex: 3; /* Allow main content to take more space */
}

.info-panel {
  flex: 1; /* Info panel takes less space */
  background-color: #f9f9f9;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  height: fit-content; /* Adjust height to content */
}

.info-panel h2 {
  margin-top: 0;
  color: #42b983;
}

.info-panel p,
.info-panel ul {
  font-size: 0.9em;
  line-height: 1.6;
  color: #333;
}

.info-panel ul {
  padding-left: 20px;
}

h1 {
  color: #42b983;
}
label {
  margin-right: 5px;
}
input[type="number"] {
  width: 100px;
  margin-right: 10px;
  padding: 5px;
}
button {
  padding: 5px 10px;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.chart-container {
  margin-top: 20px;
}

.loading-indicator {
  margin-top: 20px;
  text-align: center;
}

hr {
  margin: 20px 0;
}

/* Dark Mode Styles */
.dark-mode {
  background-color: #1e1e1e; /* Dark background for the whole container */
  color: #e0e0e0; /* Lighter default text color */
}

.dark-mode h1,
.dark-mode .info-panel h2 {
  color: #64dd17; /* Brighter green for titles */
}

.dark-mode hr {
  border-color: #444;
}

.dark-mode label {
  color: #ccc;
}

.dark-mode input[type="number"] {
  background-color: #333;
  color: #eee;
  border: 1px solid #555;
}

.dark-mode button {
  background-color: #555;
  color: #eee;
  border: 1px solid #777;
}

.dark-mode button:disabled {
  background-color: #444;
  color: #888;
  opacity: 0.7;
}

.dark-mode .info-panel {
  background-color: #2a2a2a;
  border: 1px solid #444;
}

.dark-mode .info-panel p,
.dark-mode .info-panel ul {
  color: #ccc;
}

.dark-mode .error-message {
  color: #ff6b6b; /* Brighter red for errors */
}

/* NOTE: Chart.js dark mode might require additional configuration */
/* These styles might not affect the chart itself significantly */
.dark-mode .chart-container {
  /* Remove specific background and padding for the container in dark mode */
  /* background-color: #2a2a2a; */ 
  /* padding: 10px; */
  border-radius: 4px; /* Keep the border-radius if desired */
}

/* Add other dark mode styles as needed */
</style> 