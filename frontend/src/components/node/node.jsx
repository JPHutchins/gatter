import { useState, useRef } from 'react';
import { useContext } from 'use-context-selector';
import { store } from 'store';
import { useXarrow } from 'react-xarrows';

import Draggable from 'react-draggable';

import { useNextNodeId } from 'utils/hooks';

import { NODE } from 'utils/constants';

const CursorNode = ({ nodeId }) => {
    const [activeDrags, setActiveDrags] = useState(1);
    const [deltaPosition, setDeltaPosition] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState(null);

    const nodeRef = useRef(null);

    const updateXarrow = useXarrow();

    const handleDrag = (e, ui) => {
        e.preventDefault();
        const { x } = deltaPosition;
        setDeltaPosition({ x: x + ui.deltaX, y: ui.deltaY });
        updateXarrow();
    };

    const handleStart = () => {
        setActiveDrags(activeDrags + 1);
    };

    const handleStop = (e) => {
        setActiveDrags(activeDrags - 1);
        setPosition({ x: 0, y: 0 });
    };

    const dragHandlers = { onStart: handleStart, onStop: handleStop, onDrag: handleDrag };

    return (
        <Draggable cancel=".no-drag" nodeRef={nodeRef} {...dragHandlers} position={position}>
            <div id={`cursor-node-${nodeId}`} className="cursor-node" ref={nodeRef}></div>
        </Draggable>
    );
};


const Node = ({ direction }) => {
    const nodeId = useNextNodeId();

    const globalState = useContext(store);
    const { dispatch, state } = globalState;

    const [validHoverClassLabel, setValidHoverClassLabel] = useState("");
    const [cursor, setCursor] = useState(<CursorNode nodeId={nodeId} />);

    const selectedOutputClassLabel = nodeId === state?.selectedOutput ? "selected-output" : "";

    const handleMouseEnter = () => {
        if (direction === NODE.OUTPUT) {
            setValidHoverClassLabel(state?.selectedOutput === null ? "valid-hover" : "");
        }
        if (direction === NODE.INPUT) {
            setValidHoverClassLabel(state?.selectedOutput !== null ? "valid-hover" : "")
        }
    };



    const handleMouseDown = (e) => {
        e.preventDefault();  // catch the mouse down here

        const rect = e.target.getBoundingClientRect();
        /* get the x, y offset from the center of the node */
        const offsetX = e.clientX - rect.left - ((rect.right - rect.left) / 2);
        const offsetY = e.clientY - rect.top - ((rect.bottom - rect.top) / 2);

        if (direction === NODE.OUTPUT) {
            dispatch({
                type: 'START_CURSOR_NODE_DRAG',
                payload: {
                    start: `node-${nodeId}`,
                    end: `cursor-node-${nodeId}`,
                    offsetX,
                    offsetY
                }
            })
        }
    };


    const handleMouseUp = (e) => {
        if ((direction === NODE.INPUT) && (state?.selectedOutput !== null)) {
            dispatch({
                type: 'ADD_CONNECTION',
                payload: { end: `node-${nodeId}` }
            })
        }
    };


    return (
        <div>
            <div
                id={`node-${nodeId}`}
                className={`node ${direction} ${selectedOutputClassLabel} ${validHoverClassLabel}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setValidHoverClassLabel("")}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                {cursor}
            </div>
        </div>
    );

};

export default Node;