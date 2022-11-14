import Xarrow from 'react-xarrows';
import { store } from 'store';
import { useContextSelector } from 'use-context-selector';

const CursorArrow = ({ currentCursorNodeArrow }) => {
    if (!currentCursorNodeArrow) return null;
    const { start, end, offsetX = 0, offsetY = 0 } = currentCursorNodeArrow;

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
    const currentCursorNodeArrow = useContextSelector(store, ({ state }) => state.currentCursorNodeArrow);
    const connections = useContextSelector(store, ({ state }) => state.connections);

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