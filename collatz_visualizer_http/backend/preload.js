const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded.');

contextBridge.exposeInMainWorld('electronAPI', {
  // Function to register a callback for theme updates from the main process
  onThemeUpdate: (callback) => {
    console.log('Registering theme update listener in preload.');
    const listener = (_event, shouldUseDarkColors) => {
        console.log('Theme update received in preload:', shouldUseDarkColors);
        callback(shouldUseDarkColors);
    };
    // Listen for the 'theme-updated' message from the main process
    ipcRenderer.on('theme-updated', listener);
    
    // Return a function to remove the listener when the component unmounts
    return () => {
        console.log('Removing theme update listener in preload.');
        ipcRenderer.removeListener('theme-updated', listener);
    };
  }
}); 