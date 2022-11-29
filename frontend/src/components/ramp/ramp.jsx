import { Box, Node } from 'components';
import { useEffect, useState } from 'react';
import { store } from 'store';
import { useContextSelector } from 'use-context-selector';
import { NODE } from 'utils/constants';

const Ramp = ({ device, boxId }) => {
    const dispatch = useContextSelector(store, ({ dispatch }) => dispatch);
    // const streamIdInteger = (device.streamId.deviceId << 8) | device.streamId.channelId;
    // const stream = useContextSelector(store, ({ state }) => state.streams?.[streamIdInteger]) ?? {};
    const connections = useContextSelector(store, ({ state }) => state.connections);

    const [incomingArgs, setIncomingArgs] = useState(null);

    /* this component's OutputNode will use the setOutputNodeId callback to pass its nodeId
     * back to this component */
    const [outputNodeId, setOutputNodeId] = useState(null);

    useEffect(() => {
        /* send the outputs to all connected nodes whenever stream.payload changes */
        connections.filter((connection) => connection.start === outputNodeId)
            .forEach((outputConnection) => {
                outputConnection.setIncomingArgs(incomingArgs);
            });
    }, [incomingArgs]);

    const startStream = async () => {
        const response = await fetch('http://localhost:8000/api/cmd/stream/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ streamId: device.streamId })
        });
        if (response.status === 200) {
            console.log('Ramp success!');
        }
        else {
            console.error('Ramp fail!');
        }
    }

    return (
        <Box>
            <div className="input-output-wrapper">
                <h1>{boxId}</h1>
                <button onClick={startStream} >Start</button>
                <Node direction={NODE.OUTPUT} setOutputNodeId={setOutputNodeId} />
            </div>
        </Box>
    );
};

export default Ramp;