import React from 'react';

const HeadingRenderer = ({ element }) => {
  const { content, fontWeight } = element;
  return (
    <div 
      className="w-full h-full" 
      style={{ fontWeight: fontWeight || 'normal' }} 
      dangerouslySetInnerHTML={{ __html: content || '' }} 
    />
  );
};

export default HeadingRenderer;