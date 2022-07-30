const { app, BrowserWindow, dialog } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { exec } = require('node:child_process');
const { fetch } = require('cross-fetch');

const PYTHON_ALIAS = process.platform === "win32" ? "python" : "python3";

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
    });
    const child = exec(`poetry run ${PYTHON_ALIAS} main.py`, {cwd: "../backend"});
    child.stdout.on('data', (out) => {
        console.log(out.toString());
    });
    child.stderr.on('data', async(err) => {
        console.log(err.toString());
        if (err.toString().includes('Application startup complete.')) {
            console.log('Server started.');
            const response = await fetch('http://localhost:8000/tests/hello_world');
            if (!response.ok) {
                dialog.showMessageBoxSync(mainWindow, { message: 'Backend did not respond at tests/hello_world' });
                app.exit(1);
            }
            const data = await response.json();
            if (data.msg !== 'Hello world!') {
                dialog.showMessageBoxSync(mainWindow, { message: 'Backend did not respond Hello world!' });
                app.exit(1);
            }
        }
    });
    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startURL);

    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {
        child.kill('SIGINT');
        console.log('Backend closed.');
    });
}

app.on('ready', createWindow);