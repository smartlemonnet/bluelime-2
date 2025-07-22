import React from 'react';

const SelectionBox = ({ box }) => {
  if (!box) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: Math.min(box.startX, box.currentX),
        top: Math.min(box.startY, box.currentY),
        width: Math.abs(box.startX - box.currentX),
        height: Math.abs(box.startY - box.currentY),
        border: '1px solid #0EA5E9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        zIndex: 9999,
      }}
    />
  );
};

export default SelectionBox;