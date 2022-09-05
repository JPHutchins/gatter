import { useState, useEffect } from 'react';
import { store } from 'store';
import { useContext } from 'use-context-selector';

const Formula = ({ args, setOutput, boxId }) => {
    const identityFn = '(x) => x;';
    const [formulaText, setFormulaText] = useState(identityFn);
    const [editable, setEditable] = useState(false);
    const { dispatch } = useContext(store);

    const enable = () => setEditable(true);
    const disable = () => setEditable(false);
    const saveFormula = (formula) => dispatch(({
        type: 'SET_BOX_FORMULA',
        boxId,
        formula,
    }));

    const save = () => {
        // eslint-disable-next-line no-new-func
        const func = new Function(`return ${formulaText}`);
        saveFormula(func);
        disable();
    };

    useEffect(() => {
        if (!args) return null;
        const func = `return ${formulaText}`;
        // eslint-disable-next-line no-new-func
        const result = new Function(func);
        setOutput(result()(args));
    }, []);

    const handleChange = (e) => {
        setFormulaText(e.target.value);
    };

    const calculate = () => {
        if (!args) return null;
        const func = `return ${formulaText}`;
        // eslint-disable-next-line no-new-func
        const result = new Function(func);
        setOutput(result()(args));
    };

    return (
        <div className="formula">
            <code-input lang="javascript" onChange={handleChange} id={`${boxId}-input`} placeholder={identityFn} value={formulaText} disabled={!editable} />
            <div className="buttons">
                <button disabled={editable} onClick={enable}>Edit</button>
                <button disabled={!editable} onClick={save}>Save</button>
                <button disabled={editable} onClick={calculate}>Calculate</button>
            </div>
        </div>
    );
}

export default Formula;