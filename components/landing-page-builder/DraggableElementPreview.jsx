import React from 'react';
import useResponsiveStyles from '@/hooks/useResponsiveStyles';
import ImagePreview from './element-previews/ImagePreview';
import VideoPreview from './element-previews/VideoPreview';
import FormPreview from './element-previews/FormPreview';
import ButtonPreview from './element-previews/ButtonPreview';
import TextPreview from './element-previews/TextPreview';

const DraggableElementPreview = ({ element, layoutOwnerId, currentMode = 'desktop' }) => {
  const {
    type,
    content,
    fontSize,
    fontFamily,
    fontWeight,
    textAlign,
    textColor,
    backgroundColor,
    opacity,
    backgroundType,
    gradientStartColor,
    gradientEndColor,
    gradientDirection,
    borderRadius,
    shadowColor,
    shadowOffsetX,
    shadowOffsetY,
    shadowBlur,
    shadowSpread,
    blurAmount,
  } = element;

  const responsiveStyles = useResponsiveStyles(currentMode, element);

  const getElementStyle = () => {
    let baseStyle = {
      fontSize: responsiveStyles.fontSize ? `${responsiveStyles.fontSize}px` : 
        `${fontSize || (type === 'heading' ? 24 : (type === 'button' ? 16 : 14))}px`,
      fontFamily: fontFamily || 'Roboto, sans-serif',
      fontWeight: fontWeight || 'normal',
      textAlign: textAlign || (type === 'button' ? 'center' : 'left'),
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: (type === 'form' || type === 'text') ? 'flex-start' : 'center',
      alignItems: textAlign === 'center' ? 'center' : (textAlign === 'right' ? 'flex-end' : 'flex-start'),
      padding: (type === 'image' || type === 'video' || type === 'button') ? '0px' : 
        (responsiveStyles.isMobile ? '8px' : '10px'),
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      hyphens: 'auto',
      overflow: 'hidden',
      boxSizing: 'border-box',
      position: 'relative',
      color: textColor || (type === 'button' ? '#FFFFFF' : '#333333'),
      opacity: opacity !== undefined ? opacity : 1,
      borderRadius: (type === 'shape' || type === 'button' || type === 'form' || type === 'image' || type === 'video' || type === 'heading' || type === 'text') ? `${borderRadius || 0}px` : undefined,
      filter: blurAmount > 0 && (type === 'image' || type === 'video' || type === 'shape') ? `blur(${blurAmount}px)` : 'none',
      boxShadow: `${shadowOffsetX || 0}px ${shadowOffsetY || 0}px ${shadowBlur || 0}px ${shadowSpread || 0}px ${shadowColor || 'rgba(0,0,0,0)'}`
    };

    if (type === 'text') {
      baseStyle.justifyContent = 'flex-start';
      baseStyle.alignItems = 'stretch';
    } else if (type === 'form') {
      baseStyle.justifyContent = 'space-between';
      baseStyle.padding = '20px';
    }

    if (type !== 'button') {
      if ((type === 'shape' || type === 'heading' || type === 'form' || type === 'text' || type === 'video') && backgroundType === 'gradient') {
        baseStyle.backgroundImage = `linear-gradient(${gradientDirection || 'to bottom right'}, ${gradientStartColor || '#8B5CF6'}, ${gradientEndColor || '#3B82F6'})`;
        baseStyle.backgroundColor = 'transparent';
      } else {
        baseStyle.backgroundColor = backgroundColor ||
          (type === 'shape' ? '#86EFAC' :
            (type === 'heading' ? 'transparent' :
              (type === 'text' ? 'transparent' :
                (type === 'form' ? '#FFFFFF' : 'transparent'))));
      }
    } else {
      baseStyle.backgroundColor = 'transparent';
    }

    if (type === 'heading' || type === 'image' || type === 'video' || type === 'shape' || type === 'button' || type === 'text' || type === 'form') {
      const borderWidth = element.borderWidth || 0;
      const borderColor = element.borderColor || 'transparent';
      const borderStyle = element.borderStyle || 'solid';

      if (parseInt(borderWidth) > 0) {
        baseStyle.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
      } else {
        baseStyle.border = 'none';
      }
    }

    return baseStyle;
  };

  const renderContent = () => {
    switch (type) {
      case 'image':
        return <ImagePreview element={element} />;
      case 'video':
        return <VideoPreview element={element} />;
      case 'form':
        return <FormPreview element={element} layoutOwnerId={layoutOwnerId} />;
      case 'button':
        return <ButtonPreview element={element} />;
      case 'text':
        return <TextPreview element={element} />;
      case 'heading':
        return <div style={{fontWeight: fontWeight || 'normal'}} dangerouslySetInnerHTML={{ __html: content || '' }} />;
      case 'shape':
        return null; 
      default:
        return content;
    }
  };

  return (
    <div style={getElementStyle()}>
      {renderContent()}
    </div>
  );
};

export default DraggableElementPreview;