import React from 'react';

export default function Callout({ type = 'tip', title, children }) {
    const labels = { 
        tip: '💡 Tip', 
        warn: '⚠️ Warning', 
        info: 'ℹ️ Info', 
        key: '🔑 Key Concept' 
    };
    return (
        <div className={`callout ${type}`}>
            <div className="callout-title">{title || labels[type]}</div>
            <div>{children}</div>
        </div>
    );
}
