import { Box, Node } from 'components';
import { useEffect, useRef, useState } from 'react';
import { NODE } from 'utils/constants';

const Printer = ({ deleteBox, boxId }) => {
    /* create a mutable local variable that accumulates the printing */
    const textRef = useRef('');
    const [text, setText] = useState(textRef.current);

    const textareaRef = useRef();

    /* this component's InputNode will dispatch the setIncomingArgs callback when another
     * component's OutputNode connects to it */
    const setIncomingArgs = (...args) => {
        textRef.current += '\n' + JSON.stringify(...args);
        setText(textRef.current);
    };

    /* update the scroll AFTER text has rendered */
    useEffect(() => {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }, [text]);

    return (
        <Box>
            <div className="input-output-wrapper">
                <h1>{boxId}</h1>
                <Node direction={NODE.INPUT} setIncomingArgs={setIncomingArgs} />
                <textarea className="printer code-input_pre-element-styled" value={text} ref={textareaRef} />
                <button onClick={deleteBox}>Delete</button>
            </div>
        </Box>
    );
};

export default Printer;