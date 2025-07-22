import React from 'react';
import useResponsiveStyles from '@/hooks/useResponsiveStyles';

const TextRenderer = ({ element, currentMode = 'desktop' }) => {
  const {
    content,
    textAlign,
    lineHeight,
    textColor,
    fontWeight,
    fontSize,
  } = element;

  const responsiveStyles = useResponsiveStyles(currentMode, element);
  
  return (
    <div
      className="w-full h-full break-words quill-content"
      style={{
        textAlign: textAlign || 'left',
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        padding: responsiveStyles.isMobile ? '8px' : '0px',
        lineHeight: responsiveStyles.isMobile ? 
          Math.max(lineHeight || 1.5, 1.4) : 
          (typeof lineHeight === 'number' ? lineHeight : 1.5),
        color: textColor || '#E2E8F0',
        fontWeight: fontWeight || 'normal',
        fontSize: responsiveStyles.fontSize ? `${responsiveStyles.fontSize}px` : 
          (fontSize ? `${fontSize}px` : '14px'),
      }}
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
};

export default TextRenderer;