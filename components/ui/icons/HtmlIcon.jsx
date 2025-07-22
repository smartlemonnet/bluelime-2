import React from 'react';

const HtmlIcon = ({ className, size = 24, stroke = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M13 16l-4 -4l4 -4" />
    <path d="M17 8l4 4l-4 4" />
  </svg>
);

export default HtmlIcon;
