import React from 'react';

export const GRID_SIZE = 20;
export const SNAP_THRESHOLD = 8;

export const snapToGridValue = (value, grid = GRID_SIZE) => {
  return Math.round(value / grid) * grid;
};

export const getPossibleSnapLines = (elements, excludeId, canvasWidth, canvasHeight) => {
  const vLines = [0, canvasWidth / 2, canvasWidth];
  const hLines = [0, canvasHeight / 2, canvasHeight];

  elements.forEach(el => {
    if (el.id === excludeId) return;
    vLines.push(el.x);
    vLines.push(el.x + el.width / 2);
    vLines.push(el.x + el.width);
    hLines.push(el.y);
    hLines.push(el.y + el.height / 2);
    hLines.push(el.y + el.height);
  });

  return {
    vertical: [...new Set(vLines)].sort((a, b) => a - b),
    horizontal: [...new Set(hLines)].sort((a, b) => a - b),
  };
};