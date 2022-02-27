const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { spawn } = require('child_process');
const { fetch } = require("cross-fetch");

let mainWindow;

function createWindow() {
    const child = spawn(process.env.PYTHON_ALIAS, ["../backend/main.py"]);
    child.stdout.on('data', (out) => {
        console.log(out.toString());
    });
    child.stderr.on('data', (err) => {
        console.log(err.toString());
        if (err.toString().includes('Application startup complete.')) {
            console.log("Server started.")
            fetch("http://localhost:8000/tests/hello_world", {
                mode: "no-cors",
                method: "get",
                url: "http://localhost:8000",
            })
                .then(response => {
                    if (!response.ok) {
                        console.error("ERROR!");
                        throw new Error("Backend did not respond at tests/hello_world");
                    }
                    return response;
                })
                .then(response => response.json())
                .then(data => {
                    if (data.msg !== 'Hello world!') {
                        throw new Error("Backend did not respond Hello world!");
                    }
                })
        }
    });
    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false
    });
    const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startURL);

    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {
        mainWindow = null;
        child.kill('SIGINT');
        console.log("Backend closed.")
    });
}
app.on('ready', createWindow);