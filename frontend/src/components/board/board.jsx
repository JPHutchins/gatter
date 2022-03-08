import { useState } from 'react';
import { Box } from 'components';

const Board = () => {
    const [boxes, setBoxes] = useState([]);

    const deleteBox = (id) => {
        setBoxes(boxes.filter((box) => box.id !== id));
    };

    const addBox = () => {
        setBoxes([...boxes, { id: Date.now() }]);
    };

    return (
        <div id="board">
            <button onClick={addBox}>Add Box</button>
            {boxes.map((box) => (
                <Box key={box.id} deleteBox={() => deleteBox(box.id)} boxId={box.id} />
            ))}
        </div>
    );
}

export default Board;