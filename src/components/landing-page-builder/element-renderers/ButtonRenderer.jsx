import React from 'react';

const ButtonRenderer = ({ element, stopPropagation }) => {
  const {
    id,
    content,
    href,
    textColor,
    buttonColor,
    buttonHoverColor,
    borderRadius,
    fontSize,
    fontFamily,
    fontWeight,
  } = element;

  const buttonText = content || 'Button';
  const uniqueClassName = `button-editor-${id}`;
  let styleTag = document.getElementById(uniqueClassName + '-style');

  const buttonDynamicStyle = {
    width: '100%',
    height: '100%',
    color: textColor || '#FFFFFF',
    borderRadius: `${borderRadius !== undefined ? borderRadius : 6}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
    cursor: 'pointer',
    outline: 'none',
    padding: '10px 15px',
    fontSize: `${fontSize || 16}px`,
    fontFamily: fontFamily || 'Roboto, sans-serif',
    fontWeight: fontWeight || 'normal',
    textAlign: 'center',
    textDecoration: 'none',
    boxSizing: 'border-box',
    backgroundColor: buttonColor || '#3b82f6'
  };

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
        stopPropagation(e);
      }
    },
    draggable: "false"
  } : {
    onClick: (e) => stopPropagation(e)
  };

  return (
    <ButtonComponent {...additionalProps} style={buttonDynamicStyle} className={uniqueClassName}>
      {buttonText}
    </ButtonComponent>
  );
};

export default ButtonRenderer;