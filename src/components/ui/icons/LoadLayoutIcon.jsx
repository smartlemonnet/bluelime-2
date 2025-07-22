import React from 'react';

const LoadLayoutIcon = ({ className, size = 24, stroke = "currentColor" }) => (
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
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>
    <path d="M3 7v6h6"/>
    <circle cx="12" cy="17" r="1"/>
  </svg>
);

export default LoadLayoutIcon;