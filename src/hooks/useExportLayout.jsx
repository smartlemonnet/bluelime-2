import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const getYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  let videoId = null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname.includes('youtube.com')) {
      if (urlObj.pathname.includes('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1].split('?')[0];
      } else if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      }
    } else if (hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.substring(1);
    }
  } catch (e) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      videoId = match[1];
    }
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};


const useExportLayout = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportElementToHTML = (element) => {
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
      lineHeight,
      borderWidth,
      borderColor,
      borderStyle,
      imageSourceType,
      directImageUrl,
      uploadedImageUrl,
      videoSourceType,
      directVideoUrl,
      uploadedVideoUrl,
      href,
      buttonColor,
      formFields,
      submitButtonText,
      fieldBackgroundColor,
      fieldTextColor,
      submitButtonTextColor,
      submitButtonBackgroundType,
      submitButtonGradientStartColor,
      submitButtonGradientEndColor,
      submitButtonGradientDirection,
      submitButtonColor: formSubmitButtonSolidColor,
      buttonHoverColor,
    } = element;

    let style = `
      font-size: ${fontSize || (type === 'heading' ? '24' : (type === 'button' ? '16' : '14'))}px;
      font-family: ${fontFamily || 'Roboto, sans-serif'};
      font-weight: ${fontWeight || 'normal'};
      text-align: ${textAlign || 'left'};
      color: ${textColor || (type === 'button' ? '#FFFFFF' : '#333333')};
      opacity: ${opacity !== undefined ? opacity : 1};
      border-radius: ${borderRadius || 0}px;
      box-shadow: ${shadowOffsetX || 0}px ${shadowOffsetY || 0}px ${shadowBlur || 0}px ${shadowSpread || 0}px ${shadowColor || 'rgba(0,0,0,0)'};
      filter: ${blurAmount > 0 ? `blur(${blurAmount}px)` : 'none'};
      line-height: ${lineHeight || 1.5};
      border: ${borderWidth || 0}px ${borderStyle || 'solid'} ${borderColor || 'transparent'};
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: ${textAlign === 'center' ? 'center' : (textAlign === 'right' ? 'flex-end' : 'flex-start')};
      padding: ${(type === 'image' || type === 'video' || type === 'button') ? '0px' : '10px'};
      box-sizing: border-box;
      overflow: hidden;
    `;

    if (type !== 'button') {
      if ((type === 'shape' || type === 'heading' || type === 'form' || type === 'text' || type === 'video') && backgroundType === 'gradient') {
        style += `background-image: linear-gradient(${gradientDirection || 'to bottom right'}, ${gradientStartColor || '#8B5CF6'}, ${gradientEndColor || '#3B82F6'}); background-color: transparent;`;
      } else {
        style += `background-color: ${backgroundColor || 'transparent'};`;
      }
    }

    let innerHTML = '';
    let additionalStyles = '';

    switch (type) {
      case 'text':
        innerHTML = `<div style="width:100%; height:100%; overflow-wrap: break-word; font-weight: ${fontWeight || 'normal'};">${content || ''}</div>`;
        break;
      case 'heading':
        innerHTML = `<div style="width:100%; height:100%; display: flex; align-items: center; justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'}; font-weight: ${fontWeight || 'normal'};">${content || ''}</div>`;
        break;
      case 'image': {
        let imageUrl = '';
        if (imageSourceType === 'url') imageUrl = directImageUrl;
        else if (imageSourceType === 'uploaded_cloud') imageUrl = uploadedImageUrl;
        else if (content && content.startsWith('http')) imageUrl = content;
        
        if (imageUrl) {
          innerHTML = `<div style="width:100%;height:100%;background-image:url('${imageUrl}');background-size:cover;background-position:center;background-repeat:no-repeat;border-radius:${borderRadius || 0}px;"></div>`;
        }
        break;
      }
      case 'video': {
        let videoUrl = '';
        if (videoSourceType === 'url') videoUrl = directVideoUrl;
        else if (videoSourceType === 'uploaded_cloud') videoUrl = uploadedVideoUrl;
        else if (content && content.startsWith('http')) videoUrl = content;

        const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

        if (youtubeEmbedUrl) {
          innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: inherit;">
              <iframe 
                src="${youtubeEmbedUrl}"
                title="YouTube video player"
                style="width: 100%; height: 100%; border: none; display: block;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
              </iframe>
            </div>
          `;
        } else if (videoUrl) {
          innerHTML = `<video src="${videoUrl}" controls style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"></video>`;
        } else {
          innerHTML = '<div>Video not found</div>';
        }
        break;
      }
      case 'button': {
        const buttonId = `btn-${Math.random().toString(36).substr(2, 9)}`;
        const buttonStyle = `
          background-color: ${buttonColor || '#3b82f6'};
          color: ${textColor || '#FFFFFF'};
          border-radius: ${borderRadius || 6}px;
          padding: 10px 15px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          font-weight: ${fontWeight || 'normal'};
          border: none;
          cursor: pointer;
        `;
        
        // Add hover CSS to the global styles
        const hoverCSS = `
          .${buttonId}:hover {
            background-color: ${buttonHoverColor || '#2563eb'} !important;
          }
        `;
        
        if (href) {
          innerHTML = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${buttonId}" style="${buttonStyle}">${content || 'Button'}</a>`;
        } else {
          innerHTML = `<button class="${buttonId}" style="${buttonStyle}">${content || 'Button'}</button>`;
        }
        
        // Store hover CSS to be added to the document head
        additionalStyles += hoverCSS;
        break;
      }
      case 'form': {
        const formTitle = content || 'Form Title';
        const fieldsHTML = (formFields || []).map(field => {
          const fieldStyle = `background-color:${fieldBackgroundColor};color:${fieldTextColor};border:1px solid #CBD5E1;width:100%;padding:10px;margin-bottom:12px;border-radius:6px;box-sizing:border-box;`;
          if (field.type === 'textarea') {
            return `<textarea name="${field.label}" placeholder="${field.label}" style="${fieldStyle}min-height:70px;" ${field.required ? 'required' : ''}></textarea>`;
          }
          return `<input type="${field.type}" name="${field.label}" placeholder="${field.label}" style="${fieldStyle}" ${field.required ? 'required' : ''} />`;
        }).join('');

        let submitButtonStyle = `color:${submitButtonTextColor};padding:10px 15px;border-radius:6px;border:none;cursor:pointer;width:100%;`;
        if (submitButtonBackgroundType === 'gradient') {
          submitButtonStyle += `background-image:linear-gradient(${submitButtonGradientDirection || 'to bottom right'}, ${submitButtonGradientStartColor || '#8B5CF6'}, ${submitButtonGradientEndColor || '#3B82F6'});`;
        } else {
          submitButtonStyle += `background-color:${formSubmitButtonSolidColor || '#6D28D9'};`;
        }

        innerHTML = `
          <h3 style="font-size:1.125rem;font-weight:600;margin-bottom:0.75rem;color:${textColor || '#333'}">${formTitle}</h3>
          ${fieldsHTML}
          <button type="submit" style="${submitButtonStyle}">${submitButtonText}</button>
        `;
        return `<form style="${style}">${innerHTML}</form>`;
      }
      case 'shape':
        return `<div style="${style}"></div>`;
      default:
        return `<div style="${style}">${content || ''}</div>`;
    }

    return `<div style="${style}">${innerHTML}</div>`;
  };

  const generateHTML = (elements, pageBackgroundColor, layoutName) => {
    const bodyContent = elements.map(el => {
      const elementStyle = `
        position: absolute;
        left: ${el.x}px;
        top: ${el.y}px;
        width: ${el.width}px;
        height: ${el.height}px;
        z-index: ${el.zIndex || 1};
      `;
      const { innerHTML, additionalStyles } = exportElementToHTML(el);
      return `<div style="${elementStyle}">${innerHTML}</div>`;
    }).join('\n');

    const maxContentY = Math.max(0, ...elements.map(el => (el.y || 0) + (el.height || 0)));
    const pageHeight = maxContentY + 100;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${layoutName || 'Exported Layout'}</title>
        <style>
          body { 
            margin: 0; 
            background-color: ${pageBackgroundColor || '#485060'}; 
            font-family: 'Roboto', sans-serif;
            position: relative;
            height: ${pageHeight}px;
          }
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@400;700&family=Lato&family=Open+Sans&family=Poppins&family=Inter&family=Nunito&display=swap');
        </style>
      </head>
      <body>
        ${bodyContent}
      </body>
      </html>
    `;
  };

  const initiateExport = useCallback(async (elements, pageBackgroundColor, layoutName) => {
    setIsExporting(true);
    toast({
      title: "Exporting Project",
      description: "Generating HTML and preparing files for download...",
    });

    try {
      const htmlContent = generateHTML(elements, pageBackgroundColor, layoutName);
      const zip = new JSZip();
      zip.file("index.html", htmlContent);
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${layoutName || 'layout'}.zip`);

      toast({
        title: "Export Successful",
        description: "Your project has been zipped and downloaded.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: error.message || "An unknown error occurred during export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  return { isExporting, initiateExport };
};

export default useExportLayout;