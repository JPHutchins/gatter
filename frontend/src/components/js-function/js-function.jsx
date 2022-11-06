import { useState, useEffect } from 'react';
import { store } from 'store';
import { useContext } from 'use-context-selector';

const IDENTITY_FUNCTION = '(x) => x;'

const JSFunction = ({ args, boxId, setOutgoingArgs }) => {
    const { dispatch, state } = useContext(store);

    const [formulaText, setFormulaText] = useState(IDENTITY_FUNCTION);
    const [editable, setEditable] = useState(false);
    const [functionError, setFunctionError] = useState(false);
    
    const enable = () => setEditable(true);
    const disable = () => setEditable(false); 

    const save = () => {
        try {
            setFunctionError(false);
            dispatch(({
                type: 'SET_JS_FUNCTION',
                boxId,
                func: new Function(`return ${formulaText}`)(),
            }));
            disable();
        } catch (e) {
            setFunctionError(true);
            console.warn(e); // TODO: notify user of error
        }
    };

    const calculate = () => {
        try {
            setFunctionError(false);
            const output = state.boxes[boxId].func(args);
            setOutgoingArgs(output);
        } catch (e) {
            setFunctionError(true);
            console.warn(e); // TODO: notify user of error
            setOutgoingArgs(null);
        }
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
                <button disabled={editable} onClick={calculate} className={functionError ? "error" : ""}>Calculate</button>
            </div>
        </div>
    );
};

export default JSFunction;