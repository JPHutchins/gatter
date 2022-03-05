import './formula.css';

const Formula = ({ formula, setFormula, args, setOutput }) => {
    const handleChange = (e) => {
        setFormula(e.target.value);
    }

    const handleClick = () => {
        const func = `return ${formula}`;
        const result = new Function(func);
        setOutput(result()(args));
    }

    return (
        <div>
            <textarea id="formula" className="formula-input" spellcheck="false" onChange={handleChange} />
            <button id="go" onClick={handleClick}>Calculate</button>
        </div>
    );
}

export default Formula;