import { useState, useEffect } from 'react';
import { Formula, Box } from 'components';
import { store } from 'store';
import { useContextSelector, useContext } from 'use-context-selector';

const TEST_ARGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const FunctionBox = ({ deleteBox, args = TEST_ARGS, boxId }) => {
    const [output, setOutput] = useState('');
    const box = useContextSelector(store, ({ state }) => state.boxes?.[boxId]) ?? {};
    const { inputs = TEST_ARGS, formula, next } = box;
    const { dispatch } = useContext(store);

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
    }, [inputs, formula])
    return (
        <Box>
            <div className="input-output-wrapper">
                <h1>{boxId}</h1>
                <div className="input-output">
                    <p><strong>Input:</strong> {`${JSON.stringify(inputs)}`}</p>
                </div>
                <Formula args={args} setOutput={setOutput} boxId={boxId} />
                <div className="input-output">
                    <p><strong>Output:</strong> {`${JSON.stringify(output)}`}</p>
                </div>
                <button onClick={deleteBox}>Delete</button>
            </div>
        </Box>
    );
}

export default FunctionBox;