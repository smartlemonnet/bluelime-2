import React from 'react';

const TextPreview = ({ element }) => {
  const { content, lineHeight } = element;

  const textContentStyle = {
    width: '100%',
    height: '100%',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    lineHeight: typeof lineHeight === 'number' ? lineHeight : 1.5,
  };

  return (
    <div
      className="w-full h-full quill-content"
      style={textContentStyle}
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
};

export default TextPreview;