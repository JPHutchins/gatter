import './box.css';

import { useState } from 'react';
import Draggable from 'react-draggable';

const Box = () => {
    const [activeDrags, setActiveDrags] = useState(0);
    const [deltaPosition, setDeltaPosition] = useState({ x: 0, y: 0 });
    const [formula, setFormula] = useState("");
    const [output, setOutput] = useState(NaN);

    const args = [1, 2];

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

    const handleFormulaChange = (e) => {
        setFormula(e.target.value);
    }

    const handleClick = () => {
        const func = `return ${formula}`;
        const result = new Function(func);
        console.warn(result);
        console.warn(result());
        setOutput(result()(args));
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
                <div className="box-contents">
                    <div>{`${args}`}</div>
                    <textarea id="formula" className="formula-input" spellcheck="false" onChange={handleFormulaChange}/>
                    <button id="go" onClick={handleClick}>Calculate</button>
                    <div>{`${output}`}</div>
                </div>
            </div>
        </Draggable>
    );
}

export default Box;