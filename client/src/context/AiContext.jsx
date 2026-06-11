import React, { createContext, useContext, useState } from 'react';

const AiContext = createContext(null);

export function AiProvider({ children }) {
    // Socrates Drawer States
    const [socratesOpen, setSocratesOpen] = useState(false);
    const [socratesCode, setSocratesCode] = useState('');
    const [socratesLang, setSocratesLang] = useState('javascript');
    const [socratesTitle, setSocratesTitle] = useState('');

    // AI Grader Drawer States
    const [graderOpen, setGraderOpen] = useState(false);
    const [graderProject, setGraderProject] = useState(null);

    const openSocrates = (code, lang, title) => {
        setSocratesCode(code);
        setSocratesLang(lang || 'javascript');
        setSocratesTitle(title || '');
        setSocratesOpen(true);
    };

    const closeSocrates = () => {
        setSocratesOpen(false);
    };

    const openGrader = (project) => {
        setGraderProject(project);
        setGraderOpen(true);
    };

    const closeGrader = () => {
        setGraderOpen(false);
        setGraderProject(null);
    };

    return (
        <AiContext.Provider value={{
            socratesOpen,
            socratesCode,
            socratesLang,
            socratesTitle,
            openSocrates,
            closeSocrates,
            graderOpen,
            graderProject,
            openGrader,
            closeGrader
        }}>
            {children}
        </AiContext.Provider>
    );
}

export const useAi = () => {
    const context = useContext(AiContext);
    if (!context) {
        throw new Error('useAi must be used within an AiProvider');
    }
    return context;
};
