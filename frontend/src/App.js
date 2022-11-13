import "@fontsource/fira-code";
import { useEffect } from 'react';
import { store } from 'store';
import { useContext } from 'use-context-selector';
import { Board } from './components';
import './static/css/main.scss';

const { ipcRenderer } = window.require('electron');

function App() {
    const globalState = useContext(store);
    const { dispatch, state } = globalState;

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/api/ws/streams');
        const ws2 = new WebSocket('ws://localhost:8000/api/ws/blediscovery');

        ipcRenderer.on('ADD_FUNCTION', () => dispatch({ type: 'ADD_BOX', boxId: Date.now() }));
        ipcRenderer.on('ADD_PRINTER', () => dispatch({ type: 'ADD_PRINTER', boxId: Date.now() }));
        ipcRenderer.on('ADD_BYTE_PARSER', () => dispatch({ type: 'ADD_BYTE_PARSER', boxId: Date.now() }));

        ws.onmessage = async (e) => {
            const buffer = await e.data.arrayBuffer();
            const deviceId = new Uint8Array(buffer, 0, 1);
            const channelId = new Uint8Array(buffer, 1, 1);
            const length = new Uint16Array(buffer, 2, 1);
            const payload = new Uint8Array(buffer, 4, length[0]);

            dispatch({
                type: 'UPDATE_STREAM',
                deviceId: deviceId[0],
                channelId: channelId[0],
                stream: {
                    length: length[0],
                    payload: payload,
                }
            });
        };

        ws2.onmessage = async (message) => {
            const discoveredDevice = JSON.parse(message.data);
            const discoveredDevices = { ...state.discoveredDevices, [discoveredDevice.address]: discoveredDevice };

            dispatch({
                type: 'SET_DISCOVERED_DEVICES',
                discoveredDevices,
            });
        };
    }, []);

    return <Board />;
}

export default App;
