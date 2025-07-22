import React, { useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import DraggableElement from '@/components/landing-page-builder/DraggableElement';
import { GRID_SIZE } from '@/lib/canvasUtils';

const RND_GRID_SNAP = GRID_SIZE / 2;

const useCanvasElements = ({
  selectedElementIds,
  handleInteractionStart,
  handleDragStart,
  handleDrag,
  handleDragStop,
  handleResize,
  handleResizeStop,
  onElementRemove,
  onElementDuplicate,
}) => {
  const handleElementWrapperClick = useCallback((elementId, e) => {
    if (e) e.stopPropagation();
    handleInteractionStart(elementId, e);
  }, [handleInteractionStart]);

  const renderElement = useCallback((el) => {
    const borderThickness = '2px';
    const dashedBorderThickness = '1px';

    return (
      <Rnd
        key={el.id}
        className="element-outline"
        style={{
          zIndex: el.zIndex || 1,
          border: selectedElementIds.includes(el.id) ? `${borderThickness} solid #0EA5E9` : `${dashedBorderThickness} dashed rgba(100, 116, 139, 0.3)`,
        }}
        size={{ width: el.width, height: el.height }}
        position={{ x: el.x, y: el.y }}
        onDragStart={(e, d) => handleDragStart(e, d, el.id)}
        onDrag={(e, d) => handleDrag(e, d, el.id)}
        onDragStop={(e, d) => handleDragStop(e, d, el.id)}
        onResizeStart={(e, dir, ref) => handleInteractionStart(el.id, e)}
        onResize={(e, direction, ref, delta, position) => handleResize(e, direction, ref, delta, position, el.id)}
        onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(e, direction, ref, delta, position, el.id)}
        dragGrid={[RND_GRID_SNAP, RND_GRID_SNAP]}
        resizeGrid={[RND_GRID_SNAP, RND_GRID_SNAP]}
        minWidth={Math.max(GRID_SIZE * 2, RND_GRID_SNAP * 4)}
        minHeight={Math.max(GRID_SIZE * 2, RND_GRID_SNAP * 4)}
        bounds="parent"
        enableResizing={{ top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }}
        scale={1}
        onClick={(e) => handleInteractionStart(el.id, e)}
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
            isSelected={selectedElementIds.includes(el.id)}
            onClick={(e) => handleElementWrapperClick(el.id, e)}
            onRemove={onElementRemove}
            onDuplicate={onElementDuplicate}
          />
        </motion.div>
      </Rnd>
    );
  }, [
    selectedElementIds,
    handleInteractionStart,
    handleDragStart,
    handleDrag,
    handleDragStop,
    handleResize,
    handleResizeStop,
    onElementRemove,
    onElementDuplicate,
    handleElementWrapperClick,
  ]);

  return {
    renderElement,
  };
};

export default useCanvasElements;