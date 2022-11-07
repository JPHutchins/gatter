import { useState } from 'react';
import { JSFunction, Box, Node } from 'components';
import { store } from 'store';
import { useContextSelector } from 'use-context-selector';
import { NODE } from 'utils/constants';

const FunctionBox = ({ deleteBox, boxId }) => {
    const connections = useContextSelector(store, ({ state }) => state.connections);

    const [outputDisplay, setOutputDisplay] = useState(null);

    /* this component's InputNode will dispatch the setIncomingArgs callback when another
     * component's OutputNode connects to it */
    const [incomingArgs, setIncomingArgs] = useState(null);

    /* this component's OutputNode will use the setOutputNodeId callback to pass its nodeId
     * back to this component */
    const [outputNodeId, setOutputNodeId] = useState(null);

    const outputConnections = connections.filter((connection) => connection.start === outputNodeId);

    const setOutgoingArgs = (...args) => {
        setOutputDisplay(...args);

        /* send the output to all connected nodes */
        for (const outputConnection of outputConnections) {
            outputConnection.setIncomingArgs(...args);
        }
    }

    return (
        <Box>
            <div className="input-output-wrapper">
                <h1>{boxId}</h1>
                <div className="input-output">
                    <p><strong>Input:</strong> {`${JSON.stringify(incomingArgs)}`}</p>
                </div>
                <Node direction={NODE.INPUT} setIncomingArgs={setIncomingArgs} />
                <JSFunction args={incomingArgs} boxId={boxId} setOutgoingArgs={setOutgoingArgs} />
                <Node direction={NODE.OUTPUT} setOutputNodeId={setOutputNodeId} />
                <div className="input-output">
                    <p><strong>Output:</strong> {`${JSON.stringify(outputDisplay)}`}</p>
                </div>
                <button onClick={deleteBox}>Delete</button>
            </div>
        </Box>
    );
}

export default FunctionBox;