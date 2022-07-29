const ws = new WebSocket("ws://localhost:8000/api/ws/streams");
const ws1 = new WebSocket("ws://localhost:8000/tests/ws/hello");

const Board = () => {
    ws.onmessage = async(e) => {
        const buffer = await e.data.arrayBuffer();

        const deviceId = new Uint8Array(buffer, 0, 1);
        const streamId = new Uint8Array(buffer, 1, 1);
        const length = new Uint16Array(buffer, 2, 1);
        const payload = new Uint16Array(buffer, 4, 1);

        console.log(deviceId[0], streamId[0], length[0], payload[0]);
    }

    ws1.onmessage = (e) => {
        console.log(e.data);
    }