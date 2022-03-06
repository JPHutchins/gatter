import Draggable from 'react-draggable';
import { useState, useRef } from 'react';
import { Formula, Title } from 'components';

const TEST_ARGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const Box = ({ deleteBox, args = TEST_ARGS }) => {
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

    return (
        <Draggable
            defaultPosition={{ x: 0, y: 0 }}
            position={null}
            grid={[1, 1]}
            scale={1}
            onStart={handleStart}
            onDrag={handleDrag}
            onStop={handleStop}
            cancel=".no-drag"
            nodeRef={nodeRef}
        >
            <div className={`box ${collapsed ? 'collapsed' : ''}`} ref={nodeRef}>
                <div className="box-contents no-drag">
                    <Title collapsed={collapsed} setCollapsed={setCollapsed} />
                    <div className="input-output-wrapper">
                        <div className="input-output">
                            <h3>Input:</h3>
                            <p>{`${JSON.stringify(args)}`}</p>
                        </div>
                        <Formula args={args} setOutput={setOutput} />
                        <div className="input-output">
                            <h3>Output:</h3>
                            <p>{`${JSON.stringify(output)}`}</p>
                        </div>
                        <button onClick={deleteBox}>Delete</button>
                    </div>
                </div>
            </div>
        </Draggable>
    );
}

export default Box;