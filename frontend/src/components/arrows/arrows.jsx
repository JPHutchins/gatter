import { store } from 'store';
import { useContext } from 'use-context-selector';
import Xarrow from 'react-xarrows';

const CursorArrow = ({ currentCursorNodeArrow }) => { 
    if (!currentCursorNodeArrow) return null;
    const { start, end, offsetX = 0, offsetY = 0 } =  currentCursorNodeArrow;

    return (
        <Xarrow
            key={`key-${start}-${end}`}
            start={start}
            end={end}
            endAnchor={{ position: 'middle', offset: { x: offsetX, y: offsetY } }}
            divContainerProps={{ className: 'arrow' }}
        />
    );
};

const Arrows = () => {
    const globalState = useContext(store);
    const { state } = globalState;
    const { currentCursorNodeArrow, connections } = state;

    return (
        <>
            {connections.map(({ start, end }) => (
                <Xarrow 
                    key={`key-${start}-${end}`}
                    start={start}
                    end={end}
                    divContainerProps={{ className: 'arrow' }}
                />
            ))}
            <CursorArrow currentCursorNodeArrow={currentCursorNodeArrow} />
        </>
    )
};

export default Arrows;