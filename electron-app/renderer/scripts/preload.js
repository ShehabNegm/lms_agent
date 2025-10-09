const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runAutomation: (scriptName) => ipcRenderer.send('run-automation', scriptName)
});

