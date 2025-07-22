import { useState, useCallback, useEffect } from 'react';

const useInteractionManager = (elements, setSelectedElementIds) => {
    const [currentTool, setCurrentTool] = useState('select'); 
    
    const handleElementClick = useCallback((elementId, event) => {
        if (event.ctrlKey || event.metaKey) {
            setSelectedElementIds(prev =>
                prev.includes(elementId)
                    ? prev.filter(id => id !== elementId)
                    : [...prev, elementId]
            );
        } else {
            setSelectedElementIds([elementId]);
        }
    }, [setSelectedElementIds]);

    const handleCanvasClick = useCallback((event) => {
        const clickedOnElement = event.target.closest('.element-outline');
        if (!clickedOnElement) {
            setSelectedElementIds([]);
        }
    }, [setSelectedElementIds]);

    return {
        currentTool,
        setCurrentTool,
        handleElementClick,
        handleCanvasClick,
    };
};

export default useInteractionManager;