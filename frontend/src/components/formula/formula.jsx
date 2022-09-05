import { useState, useEffect } from 'react';

const Formula = ({ args, setOutput, boxId }) => {
    const identityFn = '(x) => x;';
    const [formula, setFormula] = useState(identityFn);
    const [editable, setEditable] = useState(false);
    const enable = () => setEditable(true);
    const disable = () => setEditable(false);
    const save = () => {
        const formulaInput = document.getElementById(`${boxId}-input`);
        setFormula(formulaInput.value);
        disable();
    };
    useEffect(() => {
        if (!args) return null;
        const func = `return ${formula}`;
        // eslint-disable-next-line no-new-func
        const result = new Function(func);
        setOutput(result()(args));
    }, []);
        
    const handleChange = (e) => {
        setFormula(e.target.value);
    }

    const calculate = () => {
        if (!args) return null;
        const formulaInput = document.getElementById(`${boxId}-input`);
        setFormula(formulaInput.value);
        const func = `return ${formulaInput.value}`;
        // eslint-disable-next-line no-new-func
        const result = new Function(func);
        setOutput(result()(args));
    }

    return (
        <div className="formula">
            <code-input lang="javascript" onBlur={handleChange} id={`${boxId}-input`} placeholder={identityFn} value={formula} disabled={!editable} />
            <div className="buttons">
                <button onClick={enable}>Edit</button>
                <button onClick={save}>Save</button>
                <button onClick={calculate}>Calculate</button>
            </div>
        </div>
    );
}

export default Formula;