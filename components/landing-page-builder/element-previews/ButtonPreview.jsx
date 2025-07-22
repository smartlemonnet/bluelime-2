import React from 'react';

const ButtonPreview = ({ element }) => {
  const {
    content,
    href,
    buttonColor,
    buttonHoverColor,
    textColor,
    borderRadius,
    fontSize,
    fontFamily,
  } = element;

  const buttonText = content || 'Button';
  const buttonStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: buttonColor || '#3b82f6',
    color: textColor || '#FFFFFF',
    borderRadius: `${borderRadius || 6}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: '10px 15px',
    fontSize: `${fontSize || 16}px`,
    fontFamily: fontFamily || 'Roboto, sans-serif',
    textAlign: 'center',
    textDecoration: 'none',
    border: 'none',
    boxSizing: 'border-box',
  };

  // Generate unique class for hover effect
  const buttonId = `btn-preview-${element.id || Math.random().toString(36).substr(2, 9)}`;
  
  // Create hover styles
  React.useEffect(() => {
    const styleId = `${buttonId}-hover-style`;
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      .${buttonId}:hover {
        background-color: ${buttonHoverColor || '#2563eb'} !important;
      }
    `;
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [buttonId, buttonHoverColor]);

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonId}
        style={buttonStyle}
        onClick={(e) => e.preventDefault()} // Prevent navigation in preview
      >
        {buttonText}
      </a>
    );
  }

  return (
    <button className={buttonId} style={buttonStyle}>
      {buttonText}
    </button>
  );
};

export default ButtonPreview;