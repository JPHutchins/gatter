import "@fontsource/fira-code";
import { useEffect, useState } from 'react';
import { store } from 'store';
import { useContextSelector } from 'use-context-selector';
import { Board } from './components';
import './static/css/main.scss';

const { ipcRenderer } = window.require('electron');

function App() {
    const dispatch = useContextSelector(store, ({ dispatch }) => dispatch);
    const streams = useContextSelector(store, ({ state }) => state.streams);

    console.log(streams);

    const [discoveredDevices, setDiscoveredDevices] = useState({});

    const addRamp = async () => {
        const response = await fetch('http://localhost:8000/api/cmd/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emitterType: 'ramp',
            })
        });
        if (response.status === 200) {
            const addResponse = await response.json();
            const streamId = (addResponse.streamId.deviceId << 8) | addResponse.streamId.channelId;
            dispatch({
                type: 'ADD_RAMP',
                device: addResponse,
                streamId: streamId,
                callback: (x) => console.log(x)
            });
        }
        else {
            console.error('Device add failed.');
        }
    }


    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/api/ws/streams');
        const ws2 = new WebSocket('ws://localhost:8000/api/ws/blediscovery');

        ipcRenderer.on('ADD_FUNCTION', () => dispatch({ type: 'ADD_BOX', boxId: Date.now() }));
        ipcRenderer.on('ADD_PRINTER', () => dispatch({ type: 'ADD_PRINTER', boxId: Date.now() }));
        ipcRenderer.on('ADD_BYTE_PARSER', () => dispatch({ type: 'ADD_BYTE_PARSER', boxId: Date.now() }));
        ipcRenderer.on('ADD_RAMP', addRamp);

        ws.onmessage = async (e) => {
            const buffer = await e.data.arrayBuffer();
            const deviceId = new Uint8Array(buffer, 0, 1);
            const channelId = new Uint8Array(buffer, 1, 1);
            const length = new Uint16Array(buffer, 2, 1);
            const payload = new Uint8Array(buffer, 4, length[0]);
            const streamId = new Uint16Array(buffer, 0, 2)[0];

            console.log(streams);

            streams[streamId].callback(payload);

            // dispatch({
            //     type: 'UPDATE_STREAM',
            //     deviceId: deviceId[0],
            //     channelId: channelId[0],
            //     stream: {
            //         length: length[0],
            //         payload: payload,
            //     }
            // });
        };

        ws2.onmessage = (message) => {
            const discoveredDevice = JSON.parse(message.data);
            setDiscoveredDevices((oldDiscoveredDevices) => ({ ...oldDiscoveredDevices, [discoveredDevice.address]: discoveredDevice }));
        };
    }, []);

    return <Board discoveredDevices={discoveredDevices} />;
}

export default App;
