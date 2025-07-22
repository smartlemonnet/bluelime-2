export const getElementStyle = (element) => {
  const {
    type,
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
    blurAmount = 0,
  } = element;

  let baseStyle = {
    fontSize: `${fontSize || (type === 'heading' ? 24 : (type === 'button' ? 16 : 14))}px`,
    fontFamily: fontFamily || 'Roboto, sans-serif',
    fontWeight: fontWeight || 'normal',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: (type === 'image' || type === 'video' || type === 'button') ? '0px' : '10px',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    hyphens: 'auto',
    overflow: 'hidden',
    cursor: 'pointer',
    boxSizing: 'border-box',
    position: 'relative',
    color: textColor || (type === 'button' ? '#FFFFFF' : '#E2E8F0'),
    opacity: opacity !== undefined ? opacity : 1,
    borderRadius: (type === 'shape' || type === 'button' || type === 'form' || type === 'image' || type === 'video' || type === 'heading' || type === 'text') ? `${borderRadius || 0}px` : undefined,
    filter: blurAmount > 0 && (type === 'image' || type === 'shape' || type === 'video') ? `blur(${blurAmount}px)` : 'none',
    boxShadow: `${shadowOffsetX || 0}px ${shadowOffsetY || 0}px ${shadowBlur || 0}px ${shadowSpread || 0}px ${shadowColor || 'rgba(0,0,0,0)'}`
  };

  if (type === 'text') {
    baseStyle.justifyContent = 'flex-start';
    baseStyle.alignItems = textAlign === 'center' ? 'center' : (textAlign === 'right' ? 'flex-end' : 'flex-start');
    baseStyle.textAlign = textAlign || 'left';
  } else if (type === 'button') {
    baseStyle.textAlign = textAlign || 'center';
    baseStyle.alignItems = 'center';
  } else {
    baseStyle.textAlign = textAlign || 'left';
    baseStyle.alignItems = textAlign === 'center' ? 'center' : (textAlign === 'right' ? 'flex-end' : 'flex-start');
  }

  if (type !== 'button') {
    if ((type === 'shape' || type === 'heading' || type === 'form' || type === 'text' || type === 'video') && backgroundType === 'gradient') {
      baseStyle.backgroundImage = `linear-gradient(${gradientDirection || 'to bottom right'}, ${gradientStartColor || '#8B5CF6'}, ${gradientEndColor || '#3B82F6'})`;
      baseStyle.backgroundColor = 'transparent';
    } else {
      baseStyle.backgroundColor = backgroundColor ||
        (type === 'shape' ? '#4A5568' :
          (type === 'heading' ? 'transparent' :
            (type === 'text' ? 'transparent' :
              (type === 'form' ? '#FFFFFF' : 'transparent'))));
    }
  } else {
    baseStyle.backgroundColor = 'transparent';
  }

  if (type === 'form') {
    baseStyle.padding = '20px';
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