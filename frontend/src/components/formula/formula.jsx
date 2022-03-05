const Formula = ({ formula, setFormula, args, setOutput }) => {
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
        <div>
            <textarea id="formula" className="formula-input" spellcheck="false" onChange={handleChange} placeholder="(x) => x"/>
            <button id="go" onClick={handleClick}>Calculate</button>
        </div>
    );
}

export default Formula;