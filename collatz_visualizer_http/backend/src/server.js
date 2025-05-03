const express = require('express');
const cors = require('cors'); // <-- 引入 cors
const collatzRoutes = require('./routes/collatz'); // <--- 引入 Collatz 路由
const app = express();
const PORT = 3001; // 或選擇其他端口

app.use(cors()); // <-- 將 cors 作為中介軟體使用 (允許所有來源)
app.use(express.json()); // 中介軟體，用於解析 JSON 請求體

// --- API 路由 ---
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});
app.use('/api/collatz', collatzRoutes); // <--- 將 Collatz 路由掛載到 /api/collatz 路徑

// --- 完善的錯誤處理中介軟體 ---
// 這個中介軟體有 4 個參數 (err, req, res, next)，Express 會識別它為錯誤處理器
app.use((err, req, res, next) => {
  // 紀錄詳細錯誤到伺服器控制台 (包含堆疊追蹤)
  console.error(`[${new Date().toISOString()}] Error on ${req.method} ${req.url}:`, err.stack);

  // 從錯誤物件中獲取狀態碼，如果沒有則默認為 500 (Internal Server Error)
  const statusCode = err.status || 500;

  // 從錯誤物件中獲取錯誤訊息，如果沒有則提供通用訊息
  const message = err.message || 'Internal Server Error';

  // 向客戶端發送 JSON 格式的錯誤回應
  res.status(statusCode).json({
    error: {
      message: message,
      // 可以考慮在開發模式下包含更多錯誤細節，但在生產環境應避免
      // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
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