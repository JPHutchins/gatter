import { useState } from 'react';

const Title = () => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState('');

    return (
        <div className="formula-title">
            {editing ? (
                <input
                    type="text"
                    aria-label="title"
                    placeholder="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setEditing(false);
                        }
                    }}
                />
            ) : (
                <h2>{title}</h2>
            )}
            <button onClick={() => setEditing(!editing)}>{editing ? 'Save' : 'Edit'}</button>
        </div>
    );
}

export default Title;