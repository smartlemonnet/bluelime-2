import { useCallback, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getYouTubeEmbedUrl } from '@/lib/utils';

const useExportLayout = () => {
  const [isExporting, setIsExporting] = useState(false);

  const generateElementHtml = useCallback(async (element) => {
    let style = `
      position: absolute;
      left: ${element.x}px;
      top: ${element.y}px;
      width: ${element.width}px;
      height: ${element.height}px;
      z-index: ${element.zIndex || 1};
      opacity: ${element.opacity !== undefined ? element.opacity : 1};
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: ${element.type === 'form' ? 'space-between' : 'flex-start'};
      align-items: ${element.textAlign === 'center' ? 'center' : (element.textAlign === 'right' ? 'flex-end' : 'flex-start')};
      box-shadow: ${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur || 0}px ${element.shadowSpread || 0}px ${element.shadowColor || 'rgba(0,0,0,0)'};
      filter: ${element.blurAmount > 0 ? `blur(${element.blurAmount}px)` : 'none'};
    `;

    if (element.type === 'shape' || element.type === 'button' || element.type === 'image' || element.type === 'video' || element.type === 'form' || element.type === 'heading' || element.type === 'text' || element.type === 'group') {
      style += `border-radius: ${element.borderRadius || 0}px;`;
    }
    
    if (element.type === 'form' || element.type === 'shape' || element.type === 'heading' || element.type === 'text' || element.type === 'video' || element.type === 'group') {
      if (element.backgroundType === 'gradient') {
        style += `
          background-image: linear-gradient(${element.gradientDirection || 'to bottom right'}, ${element.gradientStartColor || '#8B5CF6'}, ${element.gradientEndColor || '#3B82F6'});
          background-color: transparent;
        `;
      } else {
        style += `background-color: ${element.backgroundColor || (element.type === 'shape' ? '#4A5568' : (element.type === 'form' ? '#FFFFFF' : 'transparent'))};`;
      }
    } else if (element.type !== 'button' && element.type !== 'image') {
      style += `background-color: ${element.backgroundColor || 'transparent'};`;
    }

    if (element.type === 'text' || element.type === 'heading' || element.type === 'button' || element.type === 'form') {
      style += `
        font-size: ${element.fontSize || (element.type === 'heading' ? 24 : (element.type === 'button' ? 16 : 14))}px;
        color: ${element.textColor || '#333333'};
        font-family: ${element.fontFamily || 'Roboto, sans-serif'};
        font-weight: ${element.fontWeight || 'normal'};
      `;
    }
    
    if (element.type === 'text' || element.type === 'heading') {
      style += `line-height: ${typeof element.lineHeight === 'number' ? element.lineHeight : 1.5};`;
    }

    if (element.type !== 'image' && element.type !== 'video' && element.type !== 'button') {
       style += `padding: ${element.type === 'form' ? '20px' : (element.type === 'heading' || element.type === 'text' ? '10px' : '0px')};`;
    }
    
    if (element.type !== 'group' && element.borderWidth && parseInt(element.borderWidth) > 0) {
      style += `border: ${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor || 'transparent'};`;
    } else if (element.type === 'button') {
      style += `border: none;`;
    }


    style = style.replace(/\n\s+/g, ' ').trim();

    let content = '';
    let additionalStyles = '';

    switch (element.type) {
      case 'text':
        content = `<div class="quill-content-export" style="width: 100%; height: 100%; overflow-wrap: break-word; word-break: break-word; white-space: normal; font-weight: ${element.fontWeight || 'normal'}; line-height: ${typeof element.lineHeight === 'number' ? element.lineHeight : 1.5}; text-align: ${element.textAlign || 'left'};">${element.content || ''}</div>`;
        break;
      case 'heading':
        content = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: ${element.textAlign === 'center' ? 'center' : (element.textAlign === 'right' ? 'flex-end' : 'flex-start')}; text-align: ${element.textAlign || 'left'}; font-weight: ${element.fontWeight || 'normal'}; line-height: ${typeof element.lineHeight === 'number' ? element.lineHeight : 1.5};">${element.content || ''}</div>`;
        break;
      case 'button':
        const buttonIdClass = `btn-${element.id}`;
        let buttonBaseStyle = `
          width: 100%;
          height: 100%;
          background-color: ${element.buttonColor || '#3b82f6'};
          color: ${element.textColor || '#FFFFFF'};
          border-radius: ${element.borderRadius || 6}px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          cursor: pointer;
          outline: none;
          padding: 10px 15px;
          font-size: ${element.fontSize || 16}px;
          font-family: ${element.fontFamily || 'Roboto, sans-serif'};
          font-weight: ${element.fontWeight || 'normal'};
          text-align: center;
          transition: background-color 0.2s ease, border 0.2s ease;
          box-sizing: border-box;
        `;
        
        if (element.borderWidth && parseInt(element.borderWidth) > 0) {
          buttonBaseStyle += `border: ${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor || 'transparent'};`;
        } else {
          buttonBaseStyle += `border: none;`;
        }
        buttonBaseStyle = buttonBaseStyle.replace(/\n\s+/g, ' ').trim();
        
        additionalStyles = `
          .${buttonIdClass}:hover { 
            background-color: ${element.buttonHoverColor || '#2563eb'} !important; 
          }
        `;
        
        style = style.replace(/border:[^;]+;/g, ''); 
        style += `padding: 0px;`; 

        content = element.href ? 
          `<a href="${element.href}" target="_blank" rel="noopener noreferrer" class="${buttonIdClass}" style="${buttonBaseStyle}">${element.content || 'Button'}</a>` :
          `<button class="${buttonIdClass}" style="${buttonBaseStyle}">${element.content || 'Button'}</button>`;
        break;

      case 'image':
        let imageUrlToExport = '';
        if (element.imageSourceType === 'uploaded_cloud' && element.uploadedImageUrl && element.uploadedImageUrl.startsWith('http')) {
          imageUrlToExport = element.uploadedImageUrl;
        } 
        else if (element.imageSourceType === 'url' && element.directImageUrl && element.directImageUrl.startsWith('http')) {
          imageUrlToExport = element.directImageUrl;
        } 
        else if (element.content && typeof element.content === 'string' && element.content.startsWith('http')) {
            imageUrlToExport = element.content;
        }
        else if (element.imageSourceType === 'uploaded_local' && element.uploadedImageUrl && element.uploadedImageUrl.startsWith('http')) {
            imageUrlToExport = element.uploadedImageUrl;
        }
        else { 
          const placeholderKeywords = "abstract,modern,tech,minimalist";
          imageUrlToExport = `https://source.unsplash.com/featured/${element.width || 800}x${element.height || 600}/?${encodeURIComponent(placeholderKeywords)}&sig=${element.id}_export_placeholder`;
        }
        
        content = `<div style="width: 100%; height: 100%; background-image: url('${imageUrlToExport}'); background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: inherit;"></div>`;
        style += `padding: 0px;`;
        break;
      
      case 'video':
        let videoUrlToExport = '';
        if (element.videoSourceType === 'uploaded_cloud' && element.uploadedVideoUrl && element.uploadedVideoUrl.startsWith('http')) {
          videoUrlToExport = element.uploadedVideoUrl;
        } else if (element.videoSourceType === 'url' && element.directVideoUrl && element.directVideoUrl.startsWith('http')) {
          videoUrlToExport = element.directVideoUrl;
        } else if (element.content && typeof element.content === 'string' && element.content.startsWith('http')) {
          videoUrlToExport = element.content;
        }
        
        const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrlToExport);

        if (youtubeEmbedUrl) {
          content = `
            <iframe 
              src="${youtubeEmbedUrl}"
              title="YouTube video player"
              style="width: 100%; height: 100%; border: none; border-radius: inherit;"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen>
            </iframe>
          `;
        } else if (videoUrlToExport) {
            content = `<video src="${videoUrlToExport}" controls style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;"></video>`;
        } else {
            content = `<div style="width: 100%; height: 100%; background-color: #000; display: flex; align-items: center; justify-content: center; color: #fff; border-radius: inherit;">No video source</div>`;
        }
        style += `padding: 0px; overflow: hidden;`;
        break;


      case 'form':
        const formIdClass = `form-submit-${element.id}`;
        const formContainerInnerStyle = `
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        `.replace(/\n\s+/g, ' ').trim();

        const formFieldsContainerStyle = `
          overflow-y: auto; 
          flex-grow: 1; 
          padding-right: 5px; 
          margin-bottom: 15px;
        `.replace(/\n\s+/g, ' ').trim();

        const fieldsHtml = (element.formFields || []).map(field => `
          <div style="margin-bottom: 12px;">
            ${field.type === 'textarea' ?
              `<textarea
                name="${field.label.toLowerCase().replace(/\s+/g, '_')}"
                placeholder="${field.placeholder || field.label}"
                style="width: 100%; min-height: 80px; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; background-color: ${element.fieldBackgroundColor || '#FFFFFF'}; color: ${element.fieldTextColor || '#333333'}; font-size: ${element.fontSize ? element.fontSize * 0.9 : 14}px; font-family: ${element.fontFamily || 'Roboto, sans-serif'}; box-sizing: border-box; resize: vertical;"
                ${field.required ? 'required' : ''}
              ></textarea>` :
              `<input
                type="${field.type}"
                name="${field.label.toLowerCase().replace(/\s+/g, '_')}"
                placeholder="${field.placeholder || field.label}"
                style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; background-color: ${element.fieldBackgroundColor || '#FFFFFF'}; color: ${element.fieldTextColor || '#333333'}; font-size: ${element.fontSize ? element.fontSize * 0.9 : 14}px; font-family: ${element.fontFamily || 'Roboto, sans-serif'}; box-sizing: border-box;"
                ${field.required ? 'required' : ''}
              />`
            }
          </div>
        `).join('');

        let submitButtonStyle = `
          width: 100%;
          padding: 10px 15px;
          color: ${element.submitButtonTextColor || '#FFFFFF'};
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: ${element.fontSize || 16}px;
          font-family: ${element.fontFamily || 'Roboto, sans-serif'};
          font-weight: ${element.fontWeight || 'normal'};
          margin-top: auto;
          box-sizing: border-box;
          transition: opacity 0.2s ease, background-color 0.2s ease;
        `.replace(/\n\s+/g, ' ').trim();

        if (element.submitButtonBackgroundType === 'gradient') {
          submitButtonStyle += `background-image: linear-gradient(${element.submitButtonGradientDirection || 'to bottom right'}, ${element.submitButtonGradientStartColor || '#8B5CF6'}, ${element.submitButtonGradientEndColor || '#3B82F6'}); background-color: transparent;`;
        } else {
          submitButtonStyle += `background-color: ${element.submitButtonColor || '#6D28D9'};`;
        }
        
        if (element.submitButtonBackgroundType !== 'gradient' && element.submitButtonHoverColor) {
          additionalStyles += `
            .${formIdClass}:hover { 
              background-color: ${element.submitButtonHoverColor} !important; 
            }
          `;
        } else if (element.submitButtonBackgroundType === 'gradient') {
           additionalStyles += `
            .${formIdClass}:hover { 
              opacity: 0.85 !important; 
            }
          `;
        }


        content = `
          <form style="${formContainerInnerStyle}" onsubmit="alert('Form submission logic needs to be implemented on your server.'); return false;">
            <div style="${formFieldsContainerStyle}">
              <h3 style="margin: 0 0 15px 0; color: ${element.textColor || '#333333'}; font-size: ${element.fontSize || 18}px; text-align: ${element.textAlign || 'left'}; font-family: ${element.fontFamily || 'Roboto, sans-serif'}; font-weight: ${element.fontWeight || 'normal'};">
                ${element.content || 'Form Title'}
              </h3>
              ${fieldsHtml}
            </div>
            <button type="submit" class="${formIdClass}" style="${submitButtonStyle}">
              ${element.submitButtonText || 'Submit'}
            </button>
          </form>
        `;
        break;
      case 'shape':
      case 'group':
        content = '';
        break;
      default:
        content = element.content || '';
    }

    return {
      html: `<div style="${style}">${content}</div>`,
      styles: additionalStyles
    };
  }, []);

  const exportLayout = useCallback(async (elements, layoutName, layoutSlug, pageBackgroundColor) => {
    if (!elements?.length) return;
    setIsExporting(true);

    try {
      const zip = new JSZip();
      
      let maxContainerWidth = 0;
      let maxContainerHeight = 0;
      let isLikelyMobile = true;

      elements.forEach(el => {
        const elRightEdge = (el.x || 0) + (el.width || 0);
        maxContainerWidth = Math.max(maxContainerWidth, elRightEdge);
        maxContainerHeight = Math.max(maxContainerHeight, (el.y || 0) + (el.height || 0));
        if (elRightEdge > (MOBILE_VIRTUAL_PAGE_WIDTH + 50)) {
          isLikelyMobile = false;
        }
      });

      const baseWidth = isLikelyMobile ? MOBILE_VIRTUAL_PAGE_WIDTH : DESKTOP_VIRTUAL_PAGE_WIDTH;
      maxContainerWidth = Math.max(maxContainerWidth + 40, baseWidth);
      maxContainerHeight = Math.max(maxContainerHeight + 40, 600);

      const elementGenerationResults = await Promise.all(elements.map(el => generateElementHtml(el)));
      const htmlElements = elementGenerationResults.map(res => res.html).join('\n        ');
      const allAdditionalStyles = elementGenerationResults.map(res => res.styles).filter(Boolean).join('\n');
      
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${layoutName || 'Exported Landing Page'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Poppins:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Inter:wght@400;500;600;700&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="lp-container">
        ${htmlElements}
    </div>
</body>
</html>`;

      const cssContent = `
body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: ${pageBackgroundColor || '#ffffff'};
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 20px;
    padding-bottom: 20px;
    box-sizing: border-box;
}

.lp-container {
    position: relative;
    width: ${maxContainerWidth}px;
    min-height: ${maxContainerHeight}px;
    height: auto;
    margin: 0 auto;
    background-color: ${pageBackgroundColor || '#ffffff'};
}

.quill-content-export img {
    max-width: 100%;
    height: auto;
    display: block;
}

.quill-content-export p,
.quill-content-export h1,
.quill-content-export h2,
.quill-content-export h3,
.quill-content-export ul,
.quill-content-export ol,
.quill-content-export li {
    margin: 0;
    padding: 0;
    line-height: inherit;
    word-wrap: break-word;
}

.quill-content-export a {
    color: inherit;
    text-decoration: underline;
}

${allAdditionalStyles}
`;

      zip.file("index.html", htmlContent);
      zip.folder("css").file("style.css", cssContent);

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${layoutSlug || 'landing-page'}.zip`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  }, [generateElementHtml]);

  return { exportLayout, isExporting };
};

const DESKTOP_VIRTUAL_PAGE_WIDTH = 1920;
const MOBILE_VIRTUAL_PAGE_WIDTH = 390;

export default useExportLayout;