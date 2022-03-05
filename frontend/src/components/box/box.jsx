import './box.css';
import Draggable from 'react-draggable';
import { useState } from 'react';
import { Formula } from 'components';

const TEST_ARGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const Box = () => {
    const [activeDrags, setActiveDrags] = useState(0);
    const [deltaPosition, setDeltaPosition] = useState({ x: 0, y: 0 });
    const [formula, setFormula] = useState("");
    const [output, setOutput] = useState(NaN);
    const [args, setArgs] = useState(TEST_ARGS);

    const handleDrag = (e, ui) => {
        const { x, y } = deltaPosition;
        setDeltaPosition({ x: x + ui.deltaX, y: ui.deltaY });
    }

    const handleStart = () => {
        setActiveDrags(activeDrags + 1);
    }

    const handleStop = () => {
        setActiveDrags(activeDrags - 1);
    }

    return (
        <Draggable
            handle=".handle"
            defaultPosition={{ x: 0, y: 0 }}
            position={null}
            grid={[1, 1]}
            scale={1}
            onStart={handleStart}
            onDrag={handleDrag}
            onStop={handleStop}>
            <div className="box">
                <div className="box-title-bar handle">
                    Title of the function goes here
                </div>
                <Formula formula={formula} setFormula={setFormula} args={args} setOutput={setOutput} />
                <div className="box-contents">
                    <div>{`${args}`}</div>
                    <div>{`${output}`}</div>
                </div>
            </div>
        </Draggable>
    );
}

export default Box;