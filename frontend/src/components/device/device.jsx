import { useState } from 'react';

const ws = new WebSocket("ws://localhost:8000/api/ws/streams");
const ws1 = new WebSocket("ws://localhost:8000/tests/ws/hello");

const Device = () => {
    const [deviceId, setDeviceId] = useState(null);
    const [number, setNumber] = useState(0);
    const [ramp, setRamp] = useState(0);
    
    const TEST_DEVICE = {
        emitterType: "ramp",
    };

    const TEST_STREAM = {
        streamId: {
            device_id: deviceId,
            channel_id: 0,
        }
    };

    const addDevice = async(deviceObject) => {
        const response = await fetch("http://localhost:8000/api/cmd/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(deviceObject)
        });
        const addCommandResponse = await response.json();
        const { deviceId } = addCommandResponse;
        setDeviceId(deviceId);
        return addCommandResponse;
    };
    
    const startStream = async(streamObject) => {
        const response = await fetch("http://localhost:8000/api/cmd/stream/start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(streamObject),
        });
        const startStreamResponse = await response.json();
        console.log(startStreamResponse);
        return startStreamResponse;
    };

    ws.onmessage = async(e) => {
        const buffer = await e.data.arrayBuffer();

        const deviceId = new Uint8Array(buffer, 0, 1);
        const streamId = new Uint8Array(buffer, 1, 1);
        const length = new Uint16Array(buffer, 2, 1);
        const payload = new Uint16Array(buffer, 4, 1);
        if (ramp !== payload[0]) {
            console.error('error!!!');
        }
        setNumber(payload[0]);
        setRamp((ramp + 1) % 11)
        console.log('ramp', ramp);
        console.log('payload', payload[0]);
        // console.log(deviceId[0], streamId[0], length[0], payload[0]);
    };

    ws1.onmessage = (e) => {
        console.log(e.data);
    };

    return (
        <div>
            <button onClick={() => addDevice(TEST_DEVICE)}>Add Device</button>
            <button onClick={() => startStream(TEST_STREAM)}>Start Stream</button>
        </div>
    );
}

export default Device;