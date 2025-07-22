import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';
import DraggableElement from '@/components/landing-page-builder/DraggableElement';
import CanvasGridLines from '@/components/landing-page-builder/canvas/CanvasGridLines';
import SnapLine from '@/components/landing-page-builder/canvas/SnapLine';
import SelectionBox from '@/components/landing-page-builder/canvas/SelectionBox';
import useCanvasInteraction from '@/hooks/canvas/useCanvasInteraction';
import { GRID_SIZE } from '@/lib/canvasUtils';

const Canvas = ({ 
  elements, 
  selectedElementIds, 
  setSelectedElementIds,
  onElementClick, 
  onElementRemove, 
  onElementUpdate: onElementUpdateProp,
  onCanvasClick, 
  onElementDuplicate,
  canvasBackgroundColor, 
  canvasWidth,
  currentMode 
}) => {
  const virtualPageRef = useRef(null);
  const [localElements, setLocalElements] = useState(elements);
  
  const [isInteractingWithRnd, setIsInteractingWithRnd] = useState(false);
  const [activeSnapLines, setActiveSnapLines] = useState({ vertical: [], horizontal: [] });
  const [selectionBox, setSelectionBox] = useState(null);

  useEffect(() => {
    setLocalElements(elements);
  }, [elements]);
  
  const handleElementUpdate = useCallback((updates) => {
    if (onElementUpdateProp) {
      onElementUpdateProp(updates);
    }
  }, [onElementUpdateProp]);

  const currentVirtualPageWidth = canvasWidth;

  const dynamicVirtualPageHeight = useMemo(() => {
    // Fix #2: Usa altezza fissa 1080px per desktop, dinamica per mobile
    const minHeight = currentMode === 'desktop' ? 1080 : 
      (typeof window !== 'undefined' ? (window.innerHeight - 100) : 900);
    
    const contentHeight = (localElements || []).reduce((maxH, el) => 
      Math.max(maxH, (el.y || 0) + (el.height || 0) + GRID_SIZE * 8), minHeight);
    
    return Math.max(minHeight, contentHeight);
  }, [localElements, currentMode]);
  
  const {
    handleInteractionStart,
    handleElementWrapperClick,
    handleDragStart,
    handleDrag,
    handleDragStop,
    handleResize,
    handleResizeStop,
    handleMouseDownOnCanvas,
  } = useCanvasInteraction({
    elements: localElements,
    setElements: setLocalElements,
    selectedElementIds,
    setSelectedElementIds,
    onElementClick,
    onElementUpdate: handleElementUpdate,
    onCanvasClick,
    canvasWidth: currentVirtualPageWidth,
    virtualPageRef,
    setIsInteractingWithRnd,
    setActiveSnapLines,
    setSelectionBox,
  });

  const renderElement = (el) => {
    const isSelected = selectedElementIds.includes(el.id);
    const isGroupMember = !!el.groupId;
    const isGroupSelected = isGroupMember && selectedElementIds.includes(el.groupId);

    let borderStyle;
    if (isSelected && el.type === 'group') {
      borderStyle = '2px dashed #f59e0b';
    } else if (isSelected && !isGroupMember) {
      borderStyle = '2px solid #0EA5E9';
    } else if (isGroupSelected) {
      borderStyle = '1px dashed #f59e0b';
    } else {
      borderStyle = '1px solid transparent';
    }

    const isDraggable = !isGroupMember || el.type === 'group';
    const isResizable = isSelected && (!isGroupMember || el.type === 'group');

    return (
      <Rnd
        key={el.id}
        className="element-outline"
        style={{ zIndex: el.zIndex || 1, border: borderStyle }}
        size={{ width: el.width, height: el.height }}
        position={{ x: el.x, y: el.y }}
        onDragStart={(e, d) => handleDragStart(e, d, el.id)}
        onDrag={(e, d) => handleDrag(e, d, el.id)}
        onDragStop={(e, d) => handleDragStop(e, d, el.id)}
        onResizeStart={(e, dir, ref) => handleInteractionStart(el.id, e)}
        onResize={(e, direction, ref, delta, position) => handleResize(e, direction, ref, delta, position, el.id)}
        onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(e, direction, ref, delta, position, el.id)}
        dragGrid={[10, 10]}
        resizeGrid={[10, 10]}
        minWidth={40}
        minHeight={40}
        bounds="parent"
        disableDragging={!isDraggable}
        enableResizing={isResizable ? { top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true } : false }
        scale={1}
        onClick={(e) => { handleInteractionStart(el.id, e); }}
      >
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.15 }}
        >
          <DraggableElement
            element={el}
            isSelected={isSelected}
            onClick={(e) => handleElementWrapperClick(el.id, e)}
            onRemove={onElementRemove}
            onDuplicate={onElementDuplicate}
            currentMode={currentMode}
          />
        </motion.div>
      </Rnd>
    );
  };

  // Fix #3: Usa PNG come silhouette mobile - niente wrapper grigio
  const mobileStyles = currentMode === 'mobile' ? {
    borderRadius: '0px',
    border: 'none',
    boxShadow: 'none',
    position: 'relative',
  } : {};
  
  const canvasWrapperStyles = currentMode === 'mobile' ? {
    background: 'transparent',
    padding: '0px',
    borderRadius: '0px',
    margin: '20px auto',
    maxWidth: '390px',
    boxShadow: 'none',
    minHeight: '800px',
  } : {};

  return (
    <>
      <div style={canvasWrapperStyles}>
        {currentMode === 'mobile' ? (
          <div 
            className="relative mx-auto"
            style={{
              width: '390px',
              height: '800px',
              overflow: 'auto',
              borderRadius: '25px',
              marginTop: '20px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: {
                display: 'none'
              }
            }}
          >
            <div 
              ref={virtualPageRef}
              className="relative"
              style={{
                width: `${currentVirtualPageWidth}px`, 
                height: `${dynamicVirtualPageHeight}px`,
                minHeight: `${dynamicVirtualPageHeight}px`, 
                backgroundColor: canvasBackgroundColor || '#485060', 
                transition: 'all 0.3s ease',
                cursor: isInteractingWithRnd ? 'grabbing' : 'default',
                ...mobileStyles
              }}
              onMouseDown={handleMouseDownOnCanvas}
            >
              <CanvasGridLines canvasWidth={currentVirtualPageWidth} canvasHeight={dynamicVirtualPageHeight} />
              {activeSnapLines.vertical.map(pos => <SnapLine key={`v-${pos}`} type="vertical" position={pos} />)}
              {activeSnapLines.horizontal.map(pos => <SnapLine key={`h-${pos}`} type="horizontal" position={pos} />)}
              <SelectionBox box={selectionBox} />
              <AnimatePresence>
                {localElements
                  .filter(el => el.type !== 'section')
                  .sort((a,b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map((el) => renderElement(el))
                }
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div 
            ref={virtualPageRef}
            className="relative shadow-xl mx-auto overflow-hidden"
            style={{
              width: `${currentVirtualPageWidth}px`, 
              height: `${dynamicVirtualPageHeight}px`,
              minHeight: `${dynamicVirtualPageHeight}px`, 
              backgroundColor: canvasBackgroundColor || '#D7DEED', 
              marginTop: '20px',
              marginBottom: '20px',
              transition: 'all 0.3s ease',
              cursor: isInteractingWithRnd ? 'grabbing' : 'default',
              ...mobileStyles
            }}
            onMouseDown={handleMouseDownOnCanvas}
          >
            <CanvasGridLines canvasWidth={currentVirtualPageWidth} canvasHeight={dynamicVirtualPageHeight} />
            {activeSnapLines.vertical.map(pos => <SnapLine key={`v-${pos}`} type="vertical" position={pos} />)}
            {activeSnapLines.horizontal.map(pos => <SnapLine key={`h-${pos}`} type="horizontal" position={pos} />)}
            <SelectionBox box={selectionBox} />
            <AnimatePresence>
              {localElements
                .filter(el => el.type !== 'section')
                .sort((a,b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((el) => renderElement(el))
              }
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* PNG smartphone overlay - FISSO sopra tutto */}
      {currentMode === 'mobile' && (
        <div 
          className="fixed pointer-events-none"
          style={{
            backgroundImage: `url("/smartphone-silhouette.png")`,
            backgroundSize: '426px 830px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '426px',
            height: '830px',
            left: '50%',
            top: 'calc(50% + 38px)',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000
          }}
        />
      )}
    </>
  );
};

export default Canvas;