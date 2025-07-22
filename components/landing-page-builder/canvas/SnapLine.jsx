import React from 'react';

const SnapLine = ({ type, position }) => {
  const style = {
    position: 'absolute',
    backgroundColor: '#0EA5E9', 
    pointerEvents: 'none',
    zIndex: 10000, 
  };
  if (type === 'vertical') {
    style.left = `${position}px`;
    style.top = 0;
    style.width = '1px';
    style.height = '100%';
  } else { 
    style.left = 0;
    style.top = `${position}px`;
    style.width = '100%';
    style.height = '1px';
  }
  return <div style={style} />;
};

export default SnapLine;