import { useState } from 'react';

const Title = ({ collapsed, setCollapsed }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState('Title');

    return (
        <div className="formula-title">
            <input
                type="text"
                aria-label="title"
                placeholder="Title"
                value={title}
                disabled={!editing}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setEditing(false);
                    }
                }}
            />
            <button onClick={() => setEditing(!editing)}>{editing ? 'Save' : 'Edit'}</button>
            <button onClick={() => setCollapsed(!collapsed)}>{collapsed ? '+' : '-'}</button>
        </div>
    );
}

export default Title;