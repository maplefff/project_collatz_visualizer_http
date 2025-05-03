const { app, BrowserWindow, nativeTheme } = require('electron');
const path = require('path');
// 使用絕對路徑或確保相對路徑相對於 main.js 是正確的
// 在此例中，main.js 和 src 在同一層，所以 ./src/server 是正確的
const { startServer } = require('./src/server');

let mainWindow;
let expressServerInstance; // 用於儲存伺服器實例

const isDev = !app.isPackaged; // 判斷是否為開發環境

async function createWindow() {
  // 啟動 Express 伺服器
  try {
    expressServerInstance = await startServer();
    console.log('Express server started successfully.');
  } catch (error) {
    console.error('Failed to start Express server, quitting app.', error);
    app.quit();
    return;
  }

  // 建立瀏覽器視窗
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // Send initial theme state after window loads
  mainWindow.webContents.on('did-finish-load', () => {
    if (mainWindow) {
      mainWindow.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
      console.log('Sent initial theme state:', nativeTheme.shouldUseDarkColors);
    }
  });

  // 載入前端頁面
  if (isDev) {
    console.log('Waiting for Vite dev server...');
    // 增加延遲以等待 Vite 啟動 (更可靠方法是使用 wait-on)
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Attempting to load Vite URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173').catch(err => {
        console.error('Failed to load Vite URL:', err);
    });
    mainWindow.webContents.openDevTools();
  } else {
    // 生產模式：載入打包後的前端文件
    // 使用 __dirname 確保路徑相對於 main.js
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    console.log(`Loading production file from: ${indexPath}`);
    mainWindow.loadFile(indexPath).catch(err => {
         console.error('Failed to load frontend file:', err);
    });
    // --- DEBUG: Open DevTools in production too ---
    // mainWindow.webContents.openDevTools(); // Comment out or remove this line
    // --- END DEBUG ---
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Listen for system theme changes
nativeTheme.on('updated', () => {
  if (mainWindow) {
    const shouldUseDarkColors = nativeTheme.shouldUseDarkColors;
    console.log('System theme updated, sending:', shouldUseDarkColors);
    mainWindow.webContents.send('theme-updated', shouldUseDarkColors);
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (expressServerInstance) {
    console.log('Closing Express server...');
    expressServerInstance.close(() => {
      console.log('Express server closed.');
    });
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
     createWindow();
  }
}); 