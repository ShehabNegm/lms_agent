const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  win.setTitle('LMS Automation Dashboard');
  win.loadFile(path.join(__dirname, 'renderer', 'welcome.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ✅ IPC handler for running automation scripts
ipcMain.on('run-automation', (event, { scriptName, args = [] }) => {
  const scriptPath = path.join(__dirname, 'scripts', scriptName);
  const isPython = scriptName.endsWith('.py');
  const command = isPython ? 'python3' : 'node';

  console.log(`[INFO] Running ${scriptName} with args: ${args}`);

  const child = spawn(command, [scriptPath, ...args]);

  child.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[${scriptName} STDOUT] ${output}`);
    // Future: event.sender.send('log-update', output);
  });

  child.stderr.on('data', (data) => {
    const error = data.toString();
    console.error(`[${scriptName} STDERR] ${error}`);
    // Future: event.sender.send('log-update', error);
  });

  child.on('close', (code) => {
    console.log(`[INFO] ${scriptName} exited with code ${code}`);
    // Future: event.sender.send('script-complete', { scriptName, code });
  });
});

