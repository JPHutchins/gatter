import Draggable from 'react-draggable';
import { useState, useRef } from 'react';
import { Title } from 'components';
import { useXarrow } from 'react-xarrows';

const Box = ({ children }) => {
    const [activeDrags, setActiveDrags] = useState(0);
    const [deltaPosition, setDeltaPosition] = useState({ x: 0, y: 0 });
    const [collapsed, setCollapsed] = useState('');
    
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
        e.preventDefault();
        setActiveDrags(activeDrags - 1);
        updateXarrow();
    };

    const dragHandlers = { onStart: handleStart, onStop: handleStop, onDrag: handleDrag };

    return (
        <Draggable cancel=".no-drag" nodeRef={nodeRef} {...dragHandlers}>
            <div className={`box ${collapsed ? 'collapsed' : ''}`} ref={nodeRef}>
                <div className="box-contents no-drag">
                    {/* <Title collapsed={collapsed} setCollapsed={setCollapsed} /> */}
                    {children}
                </div>
            </div>
        </Draggable>
    );
}

export default Box;