const { app, BrowserWindow, dialog, Menu, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { spawn } = require('node:child_process');
const { fetch } = require('cross-fetch');

const PYTHON_ALIAS = process.platform === "win32" ? "python" : "python3";
const BACKEND_PATH = path.join(__dirname, '..', '..', 'backend');
const TRUE_IF_WINDOWS = process.platform === 'win32';
const BLERGBACKEND = TRUE_IF_WINDOWS ? "blergbackend.exe" : "blergbackend"

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            webSecurity: false,
            contextIsolation: false,
            nodeIntegration: true,
            preload: __dirname + '/preload.js',
        }
    });
    const child = isDev
        ? spawn('poetry', ['run', PYTHON_ALIAS, '-m', 'gatterserver'], { cwd: BACKEND_PATH, shell: TRUE_IF_WINDOWS, detached: false })
        : spawn(path.join(app.getAppPath(), '..', '..', 'resources', 'blergbackend', BLERGBACKEND));;
    child.stdout.on('data', (out) => {
        process.stdout.write(out.toString());
    });
    child.stderr.on('data', async (err) => {
        process.stdout.write(err.toString());
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

    const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '..', 'build/index.html')}`;

    mainWindow.loadURL(startURL);

    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {

    });

    app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            if (process.platform === 'win32') {
                // console.log("Tree killing PID: ", child.pid);
                // kill(child.pid, 'SIGTERM');
                child.stdin.write('\n');
                child.kill('SIGTERM');

            } else {
                child.stdin.write('\n');
                child.kill('SIGINT');
            }
            console.log('Backend closed.');
            app.quit()
        }
    })
}

const template = [
    {
        label: 'Edit',
        submenu: [
            {
                role: 'undo'
            },
            {
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                role: 'cut'
            },
            {
                role: 'copy'
            },
            {
                role: 'paste'
            }
        ]
    },
    {
        label: 'Add',
        submenu: [
            {
                label: 'Function',
                click: () => app.emit('ADD_FUNCTION'),
            },
            {
                label: 'Printer',
                click: () => app.emit('ADD_PRINTER'),
            },
            {
                label: 'Byte Parser',
                click: () => app.emit('ADD_BYTE_PARSER'),
            },
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                role: 'reload'
            },
            {
                role: 'toggledevtools'
            },
            {
                type: 'separator'
            },
            {
                role: 'resetzoom'
            },
            {
                role: 'zoomin'
            },
            {
                role: 'zoomout'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },
    {
        role: 'window',
        submenu: [
            {
                role: 'minimize'
            },
            {
                role: 'close'
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More'
            }
        ]
    }
]

app.on('ready', () => {
    createWindow();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    /* register IPC from main -> window */
    mainWindow.webContents.on('did-finish-load', () => {
        app.on('ADD_FUNCTION', () => mainWindow.webContents.send('ADD_FUNCTION'));
        app.on('ADD_PRINTER', () => mainWindow.webContents.send('ADD_PRINTER'));
        app.on('ADD_BYTE_PARSER', () => mainWindow.webContents.send('ADD_BYTE_PARSER'));
    });
});
