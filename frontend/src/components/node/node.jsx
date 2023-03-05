import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { useXarrow } from 'react-xarrows';
import { store } from 'store';
import { useContextSelector } from 'use-context-selector';
import { NODE } from 'utils/constants';
import { makeUseNextId } from 'utils/hooks';

const CURSOR_SHIFT_HACK = 100;

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

CursorNode.propTypes = {
    nodeId: PropTypes.string.isRequired,
    handleMouseDown: PropTypes.func.isRequired,
};

const InputNode = ({ nodeId, selectedOutput, dispatch, className, setIncomingArgs }) => {
    const handleMouseUp = () => {
        if (selectedOutput !== null) {
            dispatch({
                type: 'ADD_CONNECTION',
                end: `${nodeId}`,
                setIncomingArgs,
            });
        }
    };

    return (
        <div
            className={className}
            onMouseUp={handleMouseUp}
            id={`${nodeId}`}
        >{'>'}</div>
    );
};

InputNode.propTypes = {
    nodeId: PropTypes.string.isRequired,
    selectedOutput: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    setIncomingArgs: PropTypes.func.isRequired,
};

const OutputNode = ({ nodeId, dispatch, className }) => {
    const handleMouseDown = (e) => {
        e.preventDefault(); // catch the mouse down here
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
            <div className={className} id={`${nodeId}`}>{'>'}</div>
            <CursorNode nodeId={nodeId} handleMouseDown={handleMouseDown} />
        </>
    );
};

OutputNode.propTypes = {
    nodeId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
};

const Node = ({ setOutputNodeId, setIncomingArgs }) => {
    const dispatch = useContextSelector(store, ({ dispatch }) => dispatch);
    const selectedOutput = useContextSelector(store, ({ state }) => state.selectedOutput);

    const [validHoverClassLabel, setValidHoverClassLabel] = useState('');

    const nodeIdRef = useRef(useNextNodeId());

    useEffect(() => {
        setOutputNodeId(nodeIdRef.current);
    }, []);

    const isValidInputHover = selectedOutput !== null && direction === NODE.INPUT;
    const isValidOutputHover = selectedOutput === null && direction === NODE.OUTPUT;
    const isValidHover = isValidInputHover || isValidOutputHover;

    const selectedOutputClassLabel = nodeIdRef.current === selectedOutput ? 'selected-output' : '';

    const Component = direction === NODE.INPUT ? InputNode : OutputNode;

    return (
        <div
            className={`node-wrapper ${direction}`}
            onMouseLeave={() => setValidHoverClassLabel('')}
            onMouseEnter={() => setValidHoverClassLabel(isValidHover ? 'valid-hover' : '')}
        >
            <Component
                dispatch={dispatch}
                nodeId={nodeIdRef.current}
                selectedOutput={selectedOutput}
                className={`node ${direction} ${selectedOutputClassLabel} ${validHoverClassLabel}`}
                setIncomingArgs={setIncomingArgs}
            />
        </div>
    );
};

Node.propTypes = {
    /**
     * A node represents an input to or output from another node.
     */
    direction: PropTypes.oneOf([NODE.INPUT, NODE.OUTPUT]),
    /**
     * Required for `InputNode`s, ignored for `OutputNode`s.
     * 
     * The `InputNode` will dispatch the `setIncomingArgs` callback when another component's
     * `OutputNode` connects to it.  The `setIncomingArgs` callback may be called synchronously or
     * asynchronously depending on the nature of the outputting node.
     */
    setIncomingArgs: PropTypes.func,
    /**
     * Required for `OutputNode`s, ignored for `InputNode`s.
     * 
     * The `OutputNode` will use the `setOutputNodeId` callback to pass its `nodeId` back to its
     * parent.
     */
    setOutputNodeId: PropTypes.func,
};

export default Node;
