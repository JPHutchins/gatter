import { useState, useRef } from 'react';
import { useContext } from 'use-context-selector';
import { store } from 'store';
import { useXarrow } from 'react-xarrows';
import Draggable from 'react-draggable';
import { makeUseNextId } from 'utils/hooks';
import { NODE } from 'utils/constants';

const useNextNodeId = makeUseNextId('node');

const CursorNode = ({ nodeId, handleMouseDown }) => {
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

    const handleStart = (e) => {
        handleMouseDown(e);
        setActiveDrags(activeDrags + 1);
    };

    const handleStop = (e) => {
        setActiveDrags(activeDrags - 1);
        setPosition({ x: 0, y: 0 });
    };

    const dragHandlers = {
        onStart: handleStart,
        onStop: handleStop,
        onDrag: handleDrag,
    };

    return (
        <Draggable
            cancel=".no-drag"
            nodeRef={nodeRef}
            {...dragHandlers}
            position={position}
        >
            <div
                id={`cursor-${nodeId}`}
                className="cursor-node"
                ref={nodeRef}
            />
        </Draggable>
    );
};

const InputNode = ({ nodeId, selectedOutput, dispatch, className }) => {
    const handleMouseUp = (e) => {
        if (selectedOutput !== null) {
            dispatch({
                type: 'ADD_CONNECTION',
                payload: { end: `${nodeId}` },
            });
        }
    };

    return (
        <div
            className={className}
            onMouseUp={handleMouseUp}
            id={`${nodeId}`}
        />
    );
};

const OutputNode = ({ nodeId, dispatch, className }) => {
    const handleMouseDown = (e) => {
        e.preventDefault(); // catch the mouse down here
        const CURSOR_SHIFT_HACK = 100;
        const rect = e.target.getBoundingClientRect();
        /* get the x, y offset from the center of the node */
        const offsetX = (e.clientX - rect.left - (rect.right - rect.left) / 2) + CURSOR_SHIFT_HACK;
        const offsetY = (e.clientY - rect.top - (rect.bottom - rect.top) / 2) + CURSOR_SHIFT_HACK;

        dispatch({
            type: 'START_CURSOR_NODE_DRAG',
            payload: {
                start: `${nodeId}`,
                end: `cursor-${nodeId}`,
                offsetX,
                offsetY,
            },
        });
    };


    return (
        <>
            <div className={className} id={`${nodeId}`} />
            <CursorNode nodeId={nodeId} handleMouseDown={handleMouseDown} />
        </>
    );
};

const Node = ({ direction }) => {
    const [validHoverClassLabel, setValidHoverClassLabel] = useState('');
    const nodeId = useNextNodeId();
    const globalState = useContext(store);
    const { dispatch, state } = globalState;
    const { selectedOutput } = state;
    const isValidInputHover = selectedOutput !== null && direction === NODE.INPUT;
    const isValidOutputHover = selectedOutput === null && direction === NODE.OUTPUT;
    const isValidHover = isValidInputHover || isValidOutputHover;

    const handleMouseEnter = (e) => {
        setValidHoverClassLabel(isValidHover ? 'valid-hover' : '');
    };

    const selectedOutputClassLabel = nodeId === selectedOutput ? 'selected-output' : '';
    const className = `node ${direction} ${selectedOutputClassLabel} ${validHoverClassLabel}`;
    const Component = direction === NODE.INPUT ? InputNode : OutputNode;

    return (
        <div
            className={`node-wrapper ${direction}`}
            onMouseLeave={() => setValidHoverClassLabel('')}
            onMouseEnter={handleMouseEnter}
        >
            <Component
                dispatch={dispatch}
                nodeId={nodeId}
                selectedOutput={selectedOutput}
                className={className}
            />
        </div>
    );
};

export default Node;
