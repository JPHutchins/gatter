import { useState } from 'react';
import { Formula, Title, Box } from 'components';

const TEST_ARGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const FunctionBox = ({ deleteBox, args = TEST_ARGS, boxId }) => {
    const [output, setOutput] = useState('');

    return (
        <Box>
            <div className="input-output-wrapper">
                <div className="input-output">
                    <p><strong>Input:</strong> {`${JSON.stringify(args)}`}</p>
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