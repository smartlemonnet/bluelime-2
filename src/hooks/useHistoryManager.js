import { useState, useCallback } from 'react';

const MAX_HISTORY_LENGTH = 50;

const useHistoryManager = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const updateHistory = useCallback((newState) => {
    try {
      const currentHistoryState = history[currentHistoryIndex];
      const stringifiedCurrentState = JSON.stringify(currentHistoryState);
      const stringifiedNewState = JSON.stringify(newState);

      if (stringifiedCurrentState === stringifiedNewState) {
        return;
      }

      const newHistorySlice = history.slice(0, currentHistoryIndex + 1);
      let updatedHistory = [...newHistorySlice, JSON.parse(stringifiedNewState)];

      if (updatedHistory.length > MAX_HISTORY_LENGTH) {
        updatedHistory = updatedHistory.slice(updatedHistory.length - MAX_HISTORY_LENGTH);
        setHistory(updatedHistory);
        setCurrentHistoryIndex(MAX_HISTORY_LENGTH - 1);
      } else {
        setHistory(updatedHistory);
        setCurrentHistoryIndex(updatedHistory.length - 1);
      }
    } catch (e) {
      console.error("Error processing history update:", e, newState);
    }
  }, [history, currentHistoryIndex]);

  const getUndoState = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentHistoryIndex, history]);

  const getRedoState = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentHistoryIndex, history]);

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  return {
    history,
    currentHistoryIndex,
    getUndoState,
    getRedoState,
    updateHistory,
    canUndo,
    canRedo,
    setHistory,
    setCurrentHistoryIndex
  };
};

export default useHistoryManager;