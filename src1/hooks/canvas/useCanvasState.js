import { useRef, useState, useMemo } from 'react';
import { GRID_SIZE } from '@/lib/canvasUtils';

const useCanvasState = (elements, canvasWidth) => {
  const virtualPageRef = useRef(null);
  const [isInteractingWithRnd, setIsInteractingWithRnd] = useState(false);
  const [activeSnapLines, setActiveSnapLines] = useState({ vertical: [], horizontal: [] });
  const [selectionBox, setSelectionBox] = useState(null);

  const currentVirtualPageWidth = canvasWidth;

  const dynamicVirtualPageHeight = useMemo(() => Math.max(
    (typeof window !== 'undefined' ? (window.innerHeight - 100) : 900),
    (elements || []).reduce((maxH, el) => Math.max(maxH, (el.y || 0) + (el.height || 0) + GRID_SIZE * 8), 900)
  ), [elements]);

  return {
    virtualPageRef,
    isInteractingWithRnd,
    setIsInteractingWithRnd,
    activeSnapLines,
    setActiveSnapLines,
    selectionBox,
    setSelectionBox,
    dynamicVirtualPageHeight,
    currentVirtualPageWidth,
  };
};

export default useCanvasState;