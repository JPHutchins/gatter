const ws = new WebSocket('ws://localhost:8000/api/ws/streams');

let streams = {};
let connections = {};
let nodes = {};

const NodeProto = {
    transmit(payloadIn) {
        const payloadOut = this.func(payloadIn);
        this.inputSubscribers.forEach((id) => postMessage({ "type": "update", id, "payload": payloadIn }));
        this.outputSubscribers.forEach((id) => postMessage({ "type": "update", id, "payload": payloadOut }));
        if (this.outputId) {
            nodes[this.outputId].transmit(payloadOut);
        }
    }
};


onmessage = (e) => {
    console.log("Message from main.")
    switch (e.data.type) {
        case "connections":
            connections = e.data.connections;
            for (const { start, end } of connections) {
                if (!nodes[start]) {
                    console.log("All nodes should be defined by the time they are connected, missing ", start);
                }
                else {
                    nodes[start].outputId = end;
                }
            }
            break;
        case "streams":
            streams = e.data.streams

            break;
        default:
            throw Error();
    };
    console.log(streams);

    ws.onmessage = async (e) => {
        const buffer = await e.data.arrayBuffer();
        const length = new Uint16Array(buffer, 2, 1);
        const payload = new Uint8Array(buffer, 4, length[0]);
        const streamId = (new Uint8Array(buffer, 0, 1)[0] << 8) | new Uint8Array(buffer, 1, 1)[0];

        if (streams[streamId]) {
            const func = new Function(streams[streamId][0], streams[streamId][1], streams[streamId][2]);
            func(postMessage, payload);
        }

    }


    postMessage("OK");
}

/*

node {
    inputId: the node ID of the input node (can be null) - not needed?  wouldn't it be the same as the node used to get here, nodes[nodeId]?
    outputId: the node ID of the output node (can be null)
    func: e.g. output = func(input)
    inputSubscribers: list of UI subscriber IDs that want to see data
    outputSubscribers: list of UI subscriber IDs that want to see data
    transmit: the function described below!
}

To send data:

const out = func(in);

inputSubscribers.forEach((id) => postMessage({"type": "update", id, "payload": in}));
outputSubscribers.forEach((id) => postMessage({"type": "update", id, "payload": out}));

// send to the next node:

nodes[outputId].transmit(out);

A stream has an output so it should be able to kick off the sequence of tail calls by
calling nodes[outputId].transmit(data) in its websocket onmessage handler.

*/



