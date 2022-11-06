import { useState, useEffect } from 'react';
import { JSFunction, Box } from 'components';
import { store } from 'store';
import { useContextSelector, useContext } from 'use-context-selector';
import { Node } from 'components';
import { NODE } from 'utils/constants';

const TEST_ARGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const FunctionBox = ({ deleteBox, boxId }) => {
    const [output, setOutput] = useState('');
    const box = useContextSelector(store, ({ state }) => state.boxes?.[boxId]) ?? {};
    const connections =  useContextSelector(store, ({ state }) => state.connections) ?? [];
    const [inputs, __setInputs] = useState(TEST_ARGS);
    const setInputs = (...args) => {
        console.log(...args);
        __setInputs(...args);
    };

    const { formula, next } = box;
    const { dispatch } = useContext(store);
    const [inputNodeId, setInputNodeId] = useState(null);
    const [outputNodeId, setOutputNodeId] = useState(null);
    const inputConnection = connections.find((connection) => connection.end === inputNodeId);
    const inputConnectedNode = inputConnection?.start;
    const outputConnection = connections.find((connection) => connection.start === outputNodeId);
    const outputConnectedNode = outputConnection?.end;
    const inputSetter = outputConnection?.setInputs;

    console.log('boxId', boxId, 'inputConnectedNode', inputConnectedNode, 'outputConnectedNode', outputConnectedNode);
    useEffect(() => {
        if (formula) {
            const result = formula(inputs);
            setOutput(result);
            dispatch({
                type: 'SET_BOX_INPUTS',
                boxId: next,
                inputs: result,
            });
        }
    }, [inputs, formula]);

    return (
        <Box>
            <div className="input-output-wrapper">
                <h1>{boxId}</h1>
                <div className="input-output">
                    <p><strong>Input:</strong> {`${JSON.stringify(inputs)}`}</p>
                </div>
                <Node setInputs={setInputs} setNodeId={setInputNodeId} direction={NODE.INPUT} />
                <JSFunction args={inputs} setOutput={setOutput} boxId={boxId} inputSetter={inputSetter} />
                <Node setNodeId={setOutputNodeId} direction={NODE.OUTPUT} />
                <div className="input-output">
                    <p><strong>Output:</strong> {`${JSON.stringify(output)}`}</p>
                </div>
                <button onClick={deleteBox}>Delete</button>
            </div>
        </Box>
    );
}

export default FunctionBox;