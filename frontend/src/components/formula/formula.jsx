import { useState, useEffect } from 'react';

const Formula = ({ args, setOutput }) => {
    const [formula, setFormula] = useState('(x) => x');

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

    const handleClick = () => {
        if (!args) return null;
        const func = `return ${formula}`;
        // eslint-disable-next-line no-new-func
        const result = new Function(func);
        setOutput(result()(args));
    }

    return (
        <div className="formula">
            <textarea className="formula-input" spellCheck="false" onChange={handleChange} placeholder="(x) => x"/>
            <button onClick={handleClick}>Calculate</button>
        </div>
    );
}

export default Formula;