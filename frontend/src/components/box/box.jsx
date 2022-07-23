import Draggable from 'react-draggable';
import { useState, useRef } from 'react';
import { Formula, Title } from 'components';

const TEST_ARGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const Box = ({ deleteBox, args = TEST_ARGS, boxId }) => {
    const [activeDrags, setActiveDrags] = useState(0);
    const [deltaPosition, setDeltaPosition] = useState({ x: 0, y: 0 });
    const [output, setOutput] = useState('');
    const [collapsed, setCollapsed] = useState('');
    const nodeRef = useRef(null);

    const handleDrag = (e, ui) => {
        e.preventDefault();
        const { x } = deltaPosition;
        setDeltaPosition({ x: x + ui.deltaX, y: ui.deltaY });
    }

    const handleStart = () => {
        setActiveDrags(activeDrags + 1);
    }

    const handleStop = (e) => {
        e.preventDefault();
        setActiveDrags(activeDrags - 1);
    }

    const dragHandlers = { onStart: handleStart, onStop: handleStop, onDrag: handleDrag };

    return (
        <Draggable cancel=".no-drag" nodeRef={nodeRef} {...dragHandlers}>
            <div className={`box ${collapsed ? 'collapsed' : ''}`} ref={nodeRef}>
                <div className="box-contents no-drag">
                    <Title collapsed={collapsed} setCollapsed={setCollapsed} />
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
                </div>
            </div>
        </Draggable>
    );
}

export default Box;