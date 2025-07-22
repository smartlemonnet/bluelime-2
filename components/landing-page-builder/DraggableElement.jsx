
import React from 'react';
import { motion } from 'framer-motion';
import { Button as ShadButton } from '@/components/ui/button'; 
import { Trash2, Copy } from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/lib/utils';
import useResponsiveStyles from '@/hooks/useResponsiveStyles';
import FormRenderer from './element-renderers/FormRenderer';

const DraggableElement = ({ 
  element, 
  isSelected, 
  onClick, 
  onRemove, 
  onDuplicate,
  currentMode
}) => {
  const stopPropagationForControls = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
  };

  const {
    id,
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
    blurAmount = 0,
    href,
    buttonColor,
    buttonHoverColor,
    imageSourceType,
    directImageUrl,
    uploadedImageUrl,
    videoSourceType,
    directVideoUrl,
    uploadedVideoUrl,
    groupId,
  } = element;

  const responsiveStyles = useResponsiveStyles(currentMode, element);

  const getElementStyle = () => {
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
      padding: (type === 'image' || type === 'video' || type === 'button' || type === 'form') ? '0px' : '10px',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      hyphens: 'auto',
      overflow: 'hidden',
      cursor: 'pointer',
      boxSizing: 'border-box',
      position: 'relative',
      color: textColor || (type === 'button' ? '#FFFFFF' : '#333333'),
      opacity: opacity !== undefined ? opacity : 1,
      borderRadius: (type === 'shape' || type === 'button' || type === 'form' || type === 'image' || type === 'video' || type === 'heading' || type === 'text' || type === 'group') ? `${borderRadius || 0}px` : undefined,
      filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
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
      if ((type === 'shape' || type === 'heading' || type === 'form' || type === 'text' || type === 'video' || type === 'group') && backgroundType === 'gradient') {
        baseStyle.backgroundImage = `linear-gradient(${gradientDirection || 'to bottom right'}, ${gradientStartColor || '#8B5CF6'}, ${gradientEndColor || '#3B82F6'})`;
        baseStyle.backgroundColor = 'transparent';
      } else {
        baseStyle.backgroundColor = backgroundColor || (type === 'shape' ? '#86EFAC' : 'transparent');
      }
    } else {
      baseStyle.backgroundColor = 'transparent';
    }

    if (type === 'form') {
      baseStyle.padding = '20px';
    }

    if (groupId && type !== 'group') {
        baseStyle.pointerEvents = 'none';
    }
    
    if (type === 'group') {
        baseStyle.backgroundColor = 'rgba(0, 123, 255, 0.1)';
        baseStyle.pointerEvents = 'auto';
    }

    if (type === 'heading' || type === 'image' || type === 'video' || type === 'shape' || type === 'button' || type === 'text' || type === 'form' || type === 'group') {
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
      case 'text':
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
                Math.max(element.lineHeight || 1.5, 1.4) : 
                (typeof element.lineHeight === 'number' ? element.lineHeight : 1.5),
              color: textColor || '#333333',
              fontWeight: fontWeight || 'normal',
              fontSize: responsiveStyles.fontSize ? `${responsiveStyles.fontSize}px` : 
                (fontSize ? `${fontSize}px` : '14px'),
            }}
            dangerouslySetInnerHTML={{ __html: content || '' }}
          />
        );
      case 'heading':
        return (
          <div 
            className="w-full h-full" 
            style={{ 
              fontWeight: fontWeight || 'normal', 
              color: textColor || '#333333', 
              textAlign: textAlign || 'left',
              fontSize: responsiveStyles.fontSize ? `${responsiveStyles.fontSize}px` : 
                (fontSize ? `${fontSize}px` : '24px'),
              lineHeight: responsiveStyles.isMobile ? 
                Math.max(element.lineHeight || 1.2, 1.3) : 
                (typeof element.lineHeight === 'number' ? element.lineHeight : 1.2),
              padding: responsiveStyles.isMobile ? '4px' : '0px',
            }} 
            dangerouslySetInnerHTML={{ __html: content || '' }} 
          />
        );
      case 'image': {
        let imageUrlForDisplay = '';

        if (imageSourceType === 'uploaded_cloud' && uploadedImageUrl && uploadedImageUrl.startsWith('http')) {
          imageUrlForDisplay = uploadedImageUrl;
        } else if (imageSourceType === 'uploaded_local' && content && content.startsWith('blob:')) {
          imageUrlForDisplay = content;
        } else if (imageSourceType === 'url' && directImageUrl && directImageUrl.startsWith('http')) {
          imageUrlForDisplay = directImageUrl;
        } else if (content && (content.startsWith('http') || content.startsWith('blob:'))) {
          imageUrlForDisplay = content;
        } else if (uploadedImageUrl && uploadedImageUrl.startsWith('http')) {
          imageUrlForDisplay = uploadedImageUrl;
        } else {
          imageUrlForDisplay = 'https://t4.ftcdn.net/jpg/13/40/96/57/360_F_1340965779_ePdOzua9stloGGy282HFTbxNUz5bDMTv.jpg';
        }

        const finalImageUrl = imageUrlForDisplay === 'Put your image URL'
          ? 'https://t4.ftcdn.net/jpg/13/40/96/57/360_F_1340965779_ePdOzua9stloGGy282HFTbxNUz5bDMTv.jpg'
          : imageUrlForDisplay;

        const imageDivStyle = {
          width: '100%',
          height: '100%',
          backgroundImage: `url('${finalImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: borderRadius ? `${borderRadius}px` : undefined
        };

        return <div style={imageDivStyle} draggable="false"></div>;
      }
      case 'video': {
        let videoUrlForDisplay = '';

        if (videoSourceType === 'url' && directVideoUrl) {
          videoUrlForDisplay = directVideoUrl;
        } else if (videoSourceType === 'uploaded_cloud' && uploadedVideoUrl) {
          videoUrlForDisplay = uploadedVideoUrl;
        } else if (videoSourceType === 'uploaded_local' && content && content.startsWith('blob:')) {
          videoUrlForDisplay = content;
        } else if (content && (content.startsWith('http') || content.startsWith('blob:'))) {
          videoUrlForDisplay = content;
        }

        const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrlForDisplay);

        if (youtubeEmbedUrl) {
          return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <iframe
                src={youtubeEmbedUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: borderRadius ? `${borderRadius}px` : undefined
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded YouTube Video"
              />
              <div
                className="youtube-drag-handle"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: '40px',
                  cursor: 'move',
                }}
              ></div>
            </div>
          );
        }

        if (videoUrlForDisplay) {
          return (
            <video
              key={videoUrlForDisplay}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: borderRadius ? `${borderRadius}px` : undefined }}
              src={videoUrlForDisplay}
              controls
              muted
              playsInline
            />
          );
        }

        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: borderRadius ? `${borderRadius}px` : undefined,
            backgroundImage: `url('https://www.hi-trans.com.au/wp-content/uploads/2015/11/video-placeholder.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          </div>
        );
      }
      case 'button': {
        const buttonText = content || 'Button';
        const uniqueClassName = `button-editor-${id}`;
        let styleTag = document.getElementById(uniqueClassName + '-style');

        const buttonDynamicStyle = {
          width: '100%',
          height: '100%',
          color: textColor || '#FFFFFF',
          borderRadius: responsiveStyles.borderRadius ? `${responsiveStyles.borderRadius}px` : 
            `${borderRadius !== undefined ? borderRadius : 6}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease, opacity 0.2s ease',
          cursor: 'pointer',
          outline: 'none',
          padding: responsiveStyles.isMobile ? '8px 12px' : '10px 15px',
          fontSize: responsiveStyles.fontSize ? `${responsiveStyles.fontSize}px` : 
            `${fontSize || 16}px`,
          fontFamily: fontFamily || 'Roboto, sans-serif',
          fontWeight: fontWeight || 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          boxSizing: 'border-box'
        };
        
        // Handle gradient or solid background for buttons
        if (backgroundType === 'gradient') {
          buttonDynamicStyle.backgroundImage = `linear-gradient(${gradientDirection || 'to bottom right'}, ${gradientStartColor || '#8B5CF6'}, ${gradientEndColor || '#3B82F6'})`;
          buttonDynamicStyle.backgroundColor = 'transparent';
        } else {
          buttonDynamicStyle.backgroundColor = buttonColor || '#3b82f6';
        }

        if (styleTag) {
          styleTag.innerHTML = '';
        } else {
          styleTag = document.createElement('style');
          styleTag.id = uniqueClassName + '-style';
          document.head.appendChild(styleTag);
        }

        styleTag.innerHTML = `
          .${uniqueClassName}:hover { background-color: ${buttonHoverColor || '#2563eb'} !important; }
        `;

        const ButtonComponent = href ? 'a' : 'button';
        const additionalProps = href ? {
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: (e) => {
            if (!window.location.pathname.startsWith('/p/')) {
              e.preventDefault();
              stopPropagationForControls(e);
            }
          },
          draggable: "false"
        } : {
          onClick: (e) => stopPropagationForControls(e)
        };

        return (
          <ButtonComponent {...additionalProps} style={buttonDynamicStyle} className={uniqueClassName}>
            {buttonText}
          </ButtonComponent>
        );
      }
      case 'form': {
        return <FormRenderer element={element} currentMode={currentMode} />;
      }
      case 'shape':
        return null;
      case 'group':
        return null; // Group is just a container, no visible content itself
      default:
        return content;
    }
  };
  
  const controlButtonSize = 16;
  const controlPadding = '2px';
  const controlSpacing = '2px';
  const controlContainerTop = '5px';
  const controlContainerRight = '5px';
  const controlsZIndex = 10; 

  const handleRemoveClick = (e) => {
    stopPropagationForControls(e);
    if (onRemove) onRemove(id);
  };

  const handleDuplicateClick = (e) => {
    stopPropagationForControls(e);
    if (onDuplicate) onDuplicate(id);
  };

  const handleMainElementClick = (e) => {
    if (onClick) {
      onClick(e); 
    }
  };
  
  const showControls = isSelected && (!groupId || type === 'group');

  return (
    <motion.div
      style={getElementStyle()}
      onClick={handleMainElementClick}
      className={`draggable-element-render ${type === 'image' || type === 'video' ? 'media-element-wrapper' : ''}`}
      transition={{ duration: 0.1 }}
    >
      <div className="w-full h-full" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {renderContent()}
      </div>
      {showControls && ( 
        <div className="absolute flex bg-slate-800/80 p-0.5 rounded-md shadow-lg" style={{ top: controlContainerTop, right: controlContainerRight, padding: controlPadding, gap: controlSpacing, zIndex: controlsZIndex }} onClick={stopPropagationForControls} >
          <ShadButton variant="ghost" size="icon" onClick={handleDuplicateClick} className="text-slate-300 hover:text-sky-400 hover:bg-slate-700 h-7 w-7" title="Duplicate"><Copy size={controlButtonSize} /></ShadButton>
          <ShadButton variant="ghost" size="icon" onClick={handleRemoveClick} className="text-slate-300 hover:text-red-400 hover:bg-slate-700 h-7 w-7" title="Remove"><Trash2 size={controlButtonSize} /></ShadButton>
        </div>
      )}
    </motion.div>
  );
};

export default DraggableElement;
