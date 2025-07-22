
import { useState, useCallback } from 'react';
import { snapToGridValue, GRID_SIZE, getPossibleSnapLines, SNAP_THRESHOLD } from '@/lib/canvasUtils';

const RND_GRID_SNAP = GRID_SIZE / 2;

const useCanvasInteraction = ({
  elements,
  setElements, 
  selectedElementIds,
  setSelectedElementIds,
  onElementClick,
  onElementUpdate,
  onCanvasClick,
  canvasWidth,
  virtualPageRef,
  setIsInteractingWithRnd,
  setActiveSnapLines,
  setSelectionBox,
}) => {
  const [dragStartPositions, setDragStartPositions] = useState({});

  const handleInteractionStart = useCallback((elementId, e) => {
    if (e) e.stopPropagation();
    setIsInteractingWithRnd(true);
    if (typeof onElementClick === 'function') {
      const element = elements.find(el => el.id === elementId);
      const idToSelect = element?.groupId || elementId;
      onElementClick(idToSelect, e.shiftKey);
    }
  }, [onElementClick, setIsInteractingWithRnd, elements]);

  const handleDragStart = useCallback((e, d, elementId) => {
    handleInteractionStart(elementId, e);
    
    const startPositions = {};
    const draggedElement = elements.find(el => el.id === elementId);
    let idsToTrack = [];

    const groupId = draggedElement?.groupId || (draggedElement?.type === 'group' ? draggedElement.id : null);

    if (groupId) {
        idsToTrack = elements.filter(el => el.groupId === groupId || el.id === groupId).map(el => el.id);
    } else {
        idsToTrack = selectedElementIds.includes(elementId) ? selectedElementIds : [elementId];
    }
    
    elements.forEach(el => {
      if (idsToTrack.includes(el.id)) {
        startPositions[el.id] = { x: el.x, y: el.y };
      }
    });

    setDragStartPositions(startPositions);

  }, [handleInteractionStart, selectedElementIds, elements]);

  const handleDrag = useCallback((e, d, elementId) => {
    if (!dragStartPositions || Object.keys(dragStartPositions).length === 0) return;

    const draggedElement = elements.find(el => el.id === elementId);
    const groupId = draggedElement?.groupId || (draggedElement?.type === 'group' ? draggedElement.id : null);
    const baseElementId = groupId ? (elements.find(el => el.id === groupId)?.id || elementId) : elementId;

    const startPosForDragged = dragStartPositions[baseElementId];
    if (!startPosForDragged) return;
    
    const deltaX = d.x - startPosForDragged.x;
    const deltaY = d.y - startPosForDragged.y;

    // Calculate current position of dragged element
    const currentX = startPosForDragged.x + deltaX;
    const currentY = startPosForDragged.y + deltaY;
    const elementWidth = draggedElement?.width || 0;
    const elementHeight = draggedElement?.height || 0;
    
    // Calculate snap lines for center alignment
    const canvasHeight = virtualPageRef.current ? virtualPageRef.current.offsetHeight : 800;
    const snapLines = getPossibleSnapLines(elements, baseElementId, canvasWidth, canvasHeight);
    
    const activeVertical = [];
    const activeHorizontal = [];
    
    // Check for vertical center alignment (element center to canvas center)
    const elementCenterX = currentX + elementWidth / 2;
    const canvasCenterX = canvasWidth / 2;
    if (Math.abs(elementCenterX - canvasCenterX) < SNAP_THRESHOLD) {
      activeVertical.push(canvasCenterX);
    }
    
    // Check for horizontal center alignment (element center to canvas center)
    const elementCenterY = currentY + elementHeight / 2;
    const canvasCenterY = canvasHeight / 2;
    if (Math.abs(elementCenterY - canvasCenterY) < SNAP_THRESHOLD) {
      activeHorizontal.push(canvasCenterY);
    }
    
    // Check for alignment with other elements
    snapLines.vertical.forEach(lineX => {
      if (Math.abs(elementCenterX - lineX) < SNAP_THRESHOLD) {
        activeVertical.push(lineX);
      }
    });
    
    snapLines.horizontal.forEach(lineY => {
      if (Math.abs(elementCenterY - lineY) < SNAP_THRESHOLD) {
        activeHorizontal.push(lineY);
      }
    });
    
    // Update active snap lines
    setActiveSnapLines({
      vertical: [...new Set(activeVertical)],
      horizontal: [...new Set(activeHorizontal)]
    });

    setElements(prevElements => 
      prevElements.map(el => {
        if (dragStartPositions[el.id]) {
          return {
            ...el,
            x: dragStartPositions[el.id].x + deltaX,
            y: dragStartPositions[el.id].y + deltaY,
          };
        }
        return el;
      })
    );
  }, [dragStartPositions, setElements, elements, canvasWidth, virtualPageRef, setActiveSnapLines]);

  const handleDragStop = useCallback((e, d, elementId) => {
    setIsInteractingWithRnd(false);
    setActiveSnapLines({ vertical: [], horizontal: [] });

    if (!dragStartPositions || Object.keys(dragStartPositions).length === 0) return;
    
    const draggedElement = elements.find(el => el.id === elementId);
    const groupId = draggedElement?.groupId || (draggedElement?.type === 'group' ? draggedElement.id : null);
    const baseElementId = groupId ? (elements.find(el => el.id === groupId)?.id || elementId) : elementId;

    const startPosForDragged = dragStartPositions[baseElementId];
    if (!startPosForDragged) return;

    const deltaX = snapToGridValue(d.x - startPosForDragged.x, RND_GRID_SNAP);
    const deltaY = snapToGridValue(d.y - startPosForDragged.y, RND_GRID_SNAP);

    const finalUpdates = Object.keys(dragStartPositions).map(id => {
      const startPos = dragStartPositions[id];
      if (startPos) {
        return { id, props: { x: startPos.x + deltaX, y: startPos.y + deltaY }};
      }
      return null;
    }).filter(Boolean);

    if (finalUpdates.length > 0) {
        onElementUpdate(finalUpdates);
    }
    setDragStartPositions({});
  }, [
      onElementUpdate,
      dragStartPositions,
      setIsInteractingWithRnd,
      setActiveSnapLines,
      setDragStartPositions,
      elements
  ]);

  const handleResize = useCallback((e, direction, ref, delta, position, elementId) => {
    const resizedElement = elements.find(el => el.id === elementId);
    if (!resizedElement) return;

    const otherElements = elements.filter(el => el.id !== elementId && !selectedElementIds.includes(el.id));
    const { vertical: vSnapLines, horizontal: hSnapLines } = getPossibleSnapLines(otherElements, canvasWidth, virtualPageRef.current.offsetHeight);
    
    let newX = position.x;
    let newY = position.y;
    let newWidth = parseInt(ref.style.width, 10);
    let newHeight = parseInt(ref.style.height, 10);

    const activeV = [], activeH = [];

    [position.x, position.x + newWidth].forEach((val, i) => {
        vSnapLines.forEach(line => {
            if (Math.abs(val - line) < SNAP_THRESHOLD) {
                if (i === 0) { newX = line; newWidth += (position.x - line); } else { newWidth = line - newX; }
                activeV.push(line);
            }
        });
    });
    [position.y, position.y + newHeight].forEach((val, i) => {
        hSnapLines.forEach(line => {
            if (Math.abs(val - line) < SNAP_THRESHOLD) {
                if (i === 0) { newY = line; newHeight += (position.y - line); } else { newHeight = line - newY; }
                activeH.push(line);
            }
        });
    });
    
    setActiveSnapLines({ vertical: [...new Set(activeV)], horizontal: [...new Set(activeH)] });
    
    const updates = [{ id: elementId, props: { x: newX, y: newY, width: newWidth, height: newHeight } }];
    if (resizedElement.type === 'group') {
      const originalWidth = resizedElement.width;
      const originalHeight = resizedElement.height;
      const scaleX = newWidth / originalWidth;
      const scaleY = newHeight / originalHeight;

      elements.filter(el => el.groupId === resizedElement.id).forEach(child => {
        updates.push({
          id: child.id,
          props: {
            x: newX + child.relativeX * scaleX,
            y: newY + child.relativeY * scaleY,
            width: child.width * scaleX,
            height: child.height * scaleY,
          }
        });
      });
    }

    setElements(prevElements => {
      const newElements = [...prevElements];
      updates.forEach(({ id, props }) => {
        const elIndex = newElements.findIndex(el => el.id === id);
        if (elIndex !== -1) {
          newElements[elIndex] = { ...newElements[elIndex], ...props };
        }
      });
      return newElements;
    });

  }, [elements, canvasWidth, virtualPageRef, setActiveSnapLines, setElements, selectedElementIds]);

  const handleResizeStop = useCallback((e, direction, ref, delta, position, elementId) => {
    setIsInteractingWithRnd(false);
    setActiveSnapLines({ vertical: [], horizontal: [] });
    const currentElement = elements.find(el => el.id === elementId);
    if (!currentElement) return;

    let newX = position.x;
    let newY = position.y;
    let newWidth = parseInt(ref.style.width, 10);
    let newHeight = parseInt(ref.style.height, 10);

    newWidth = Math.max(GRID_SIZE * 2, newWidth); 
    newHeight = Math.max(GRID_SIZE * 2, newHeight);

    const snappedPos = { x: snapToGridValue(newX, RND_GRID_SNAP), y: snapToGridValue(newY, RND_GRID_SNAP) };
    const snappedWidth = snapToGridValue(newWidth, RND_GRID_SNAP);
    const snappedHeight = snapToGridValue(newHeight, RND_GRID_SNAP);

    const finalUpdates = [{ id: elementId, props: { width: snappedWidth, height: snappedHeight, x: snappedPos.x, y: snappedPos.y } }];
    
    if (currentElement.type === 'group') {
      const scaleX = snappedWidth / currentElement.width;
      const scaleY = snappedHeight / currentElement.height;
      
      elements.filter(el => el.groupId === currentElement.id).forEach(child => {
          finalUpdates.push({
            id: child.id,
            props: {
              x: snappedPos.x + child.relativeX * scaleX,
              y: snappedPos.y + child.relativeY * scaleY,
              width: snapToGridValue(child.width * scaleX, RND_GRID_SNAP),
              height: snapToGridValue(child.height * scaleY, RND_GRID_SNAP),
            }
          });
      });
    }
    
    onElementUpdate(finalUpdates);

  }, [elements, onElementUpdate, setIsInteractingWithRnd, setActiveSnapLines]);

  const handleMouseDownOnCanvas = (e) => {
    if (e.target !== e.currentTarget) return;
    if (typeof onCanvasClick === 'function') {
      onCanvasClick(e);
    }

    const startX = e.clientX - virtualPageRef.current.getBoundingClientRect().left;
    const startY = e.clientY - virtualPageRef.current.getBoundingClientRect().top;
    
    setSelectionBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });

    const handleMouseMove = (moveEvent) => {
      const currentX = moveEvent.clientX - virtualPageRef.current.getBoundingClientRect().left;
      const currentY = moveEvent.clientY - virtualPageRef.current.getBoundingClientRect().top;
      setSelectionBox(prev => ({ ...prev, currentX, currentY }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      setSelectionBox(prevBox => {
        if (!prevBox) return null;
        const { startX, startY, currentX, currentY } = prevBox;
        const x1 = Math.min(startX, currentX);
        const y1 = Math.min(startY, currentY);
        const x2 = Math.max(startX, currentX);
        const y2 = Math.max(startY, currentY);

        if (Math.abs(x1 - x2) < 5 && Math.abs(y1 - y2) < 5) {
          return null;
        }

        const selectedIds = (elements || [])
          .filter(el => {
            if (el.type === 'group' || el.groupId) return false;
            const elX1 = el.x;
            const elY1 = el.y;
            const elX2 = el.x + el.width;
            const elY2 = el.y + el.height;
            return x1 < elX2 && x2 > elX1 && y1 < elY2 && y2 > elY1;
          })
          .map(el => el.id);
        
        setSelectedElementIds(selectedIds);
        return null;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleElementWrapperClick = (elementId, e) => {
    if (typeof onElementClick === 'function') {
      const element = elements.find(el => el.id === elementId);
      const idToSelect = element?.groupId || elementId;
      onElementClick(idToSelect, e.shiftKey);
    }
    e.stopPropagation();
  };

  return {
    handleInteractionStart,
    handleElementWrapperClick,
    handleDragStart,
    handleDrag,
    handleDragStop,
    handleResize,
    handleResizeStop,
    handleMouseDownOnCanvas,
  };
};

export default useCanvasInteraction;
