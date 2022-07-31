const { app, BrowserWindow, dialog } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { spawn } = require('node:child_process');
const { fetch } = require('cross-fetch');

const PYTHON_ALIAS = process.platform === "win32" ? "python" : "python3";
const BACKEND_PATH = path.join(__dirname, '..', '..', 'backend');
const TRUE_IF_WINDOWS = process.platform === 'win32';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
    });
    const child = spawn('poetry', ['run', PYTHON_ALIAS, 'main.py'], {cwd: BACKEND_PATH, shell: TRUE_IF_WINDOWS, detached: TRUE_IF_WINDOWS});
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
        
    });

    app.on('window-all-closed', function() {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            if (process.platform === 'win32') {
                // console.log("Tree killing PID: ", child.pid);
                // kill(child.pid, 'SIGTERM');
                child.kill('SIGINT');
            } else {
                child.kill('SIGINT');
            }
            console.log('Backend closed.');
            app.quit()
        }
    })
}

app.on('ready', createWindow);