import React from 'react';
import { GRID_SIZE } from '@/lib/canvasUtils';

const CanvasGridLines = React.memo(({ canvasWidth, canvasHeight }) => {
  const linesToRender = [];
  if (!canvasWidth || !canvasHeight ) return null;
  const visualGridSize = GRID_SIZE; 
  const numVerticalLines = Math.floor(canvasWidth / visualGridSize);
  for (let i = 1; i <= numVerticalLines; i++) {
    linesToRender.push(
      <div
        key={`grid-v-line-${i}`}
        className="absolute bg-slate-400/15" 
        style={{ left: `${i * visualGridSize}px`, top: 0, width: '1px', height: '100%', pointerEvents: 'none' }}
      />
    );
  }
  const numHorizontalLines = Math.floor(canvasHeight / visualGridSize);
  for (let i = 1; i <= numHorizontalLines; i++) {
    linesToRender.push(
      <div
        key={`grid-h-line-${i}`}
        className="absolute bg-slate-400/15"
        style={{ left: 0, top: `${i * visualGridSize}px`, width: '100%', height: '1px', pointerEvents: 'none' }}
      />
    );
  }
  return <>{linesToRender}</>;
});
CanvasGridLines.displayName = 'CanvasGridLines';

export default CanvasGridLines;