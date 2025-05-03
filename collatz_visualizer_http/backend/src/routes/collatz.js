const express = require('express');
const router = express.Router();

// Collatz 計算函式
function calculateCollatzSequence(n) {
  // 輸入驗證：確保是正整數
  if (!Number.isInteger(n) || n <= 0) {
    // 拋出錯誤，讓後續的錯誤處理中介軟體捕獲
    const error = new Error('Input must be a positive integer.');
    error.status = 400; // 設定 HTTP 狀態碼
    throw error;
  }

  const sequence = [n];
  let current = n;
  const MAX_STEPS = 10000; // 設定一個最大步驟數防止意外情況

  while (current !== 1 && sequence.length <= MAX_STEPS) {
    if (current % 2 === 0) {
      current = current / 2;
    } else {
      // 檢查潛在的溢出 (3 * n + 1)
      const nextVal = 3 * current + 1;
      if (nextVal > Number.MAX_SAFE_INTEGER) {
        const error = new Error('Calculation resulted in a number too large to handle safely.');
        error.status = 400;
        throw error;
      }
      current = nextVal;
    }
    sequence.push(current);
  }

  // 檢查是否因為達到最大步驟數而停止
  if (current !== 1) {
      const error = new Error(`Sequence calculation exceeded maximum steps (${MAX_STEPS}). Input might be too large or lead to a very long sequence.`);
      error.status = 413; // 413 Payload Too Large 也可以解釋為請求導致的結果過大
      throw error;
  }

  return sequence;
}

// 定義 POST / 路由 (相對於掛載點 /api/collatz)
router.post('/', (req, res, next) => {
  try {
    // 從請求體 (request body) 中獲取前端發送的 number
    const startNumber = req.body.number;

    // 檢查 number 是否存在於請求體中
    if (startNumber === undefined) {
      const error = new Error('Missing \'number\' in request body');
      error.status = 400;
      throw error;
    }

    // 將接收到的值嘗試轉換為數字
    const number = parseInt(startNumber, 10);

    // 再次驗證確保轉換成功且是數字
    if (isNaN(number)) {
      const error = new Error('Input must be a valid number.');
      error.status = 400;
      throw error;
    }

    // 調用計算函式
    const sequence = calculateCollatzSequence(number);

    // 如果計算成功，將序列以 JSON 格式返回給前端
    res.json({ sequence });

  } catch (error) {
    // 如果在 try 區塊中發生任何錯誤 (包括 calculateCollatzSequence 拋出的錯誤)
    // 就將錯誤傳遞給 Express 的下一個錯誤處理中介軟體 (在 server.js 中定義)
    next(error);
  }
});

// 導出這個路由模組，以便在 server.js 中引入使用
module.exports = router; 