import { useState } from 'react';

const Accordion = ({ children, title, level = 1, classNames = '' }) => {
    const [expanded, setExpanded] = useState(false);

    const handleClick = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={`accordion level-${level} ${classNames}`}>
            <button className={`accordion-header level-${level} ${classNames} ${expanded ? 'expanded' : 'collapsed'}`} onClick={handleClick}>
                {title}
            </button>
            <ul className={`accordion-body level-${level} ${classNames} ${expanded ? 'expanded' : 'collapsed'}`}>
                {children}
            </ul>
        </div>
    );
}

export default Accordion;
