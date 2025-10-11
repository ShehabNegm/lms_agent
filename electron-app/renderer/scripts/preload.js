const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runAutomation: (payload) => ipcRenderer.send('run-automation', payload)
});

