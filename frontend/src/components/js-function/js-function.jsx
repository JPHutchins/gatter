import { useState, useEffect } from 'react';
import { store } from 'store';
import { useContext } from 'use-context-selector';

const IDENTITY_FUNCTION = '(x) => x;'

const JSFunction = ({ args, setOutput, boxId, inputSetter = () => {} }) => {
    const [formulaText, setFormulaText] = useState(IDENTITY_FUNCTION);
    const [editable, setEditable] = useState(false);
    const { dispatch, state } = useContext(store);

    const enable = () => setEditable(true);
    const disable = () => setEditable(false); 

    const save = () => {
        dispatch(({
            type: 'SET_JS_FUNCTION',
            boxId,
            func: new Function(`return ${formulaText}`)(),
        }));
        disable();
    };

    const calculate = () => {
        if (args === null || args === undefined) {
            return null;
        }
        const output = state.boxes[boxId].func(args);
        setOutput(output);
        inputSetter(output);
    };

    const handleChange = (e) => {
        setFormulaText(e.target.value);
    };

    useEffect(() => {
        calculate();
    }, [args]);

    return (
        <div className="formula">
            <code-input lang="javascript" onBlur={handleChange} id={`${boxId}-input`} value={formulaText} placeholder={IDENTITY_FUNCTION} disabled={!editable} />
            <div className="buttons">
                <button disabled={editable} onClick={enable}>Edit</button>
                <button disabled={!editable} onClick={save}>Save</button>
                <button disabled={editable} onClick={calculate}>Calculate</button>
            </div>
        </div>
    );
};

export default JSFunction;