import React from 'react';

const FormIcon = ({ className, size, stroke }) => (
  <svg 
    width={size || "20"} 
    height={size || "24"} 
    viewBox="0 0 20 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M2 1H18C18.5523 1 19 1.44772 19 2V22C19 22.5523 18.5523 23 18 23H2C1.44772 23 1 22.5523 1 22V2C1 1.44772 1.44771 1 2 1Z" stroke={stroke || "#FF00AA"} strokeWidth="2"/>
    <path d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V4C17 4.55228 16.5523 5 16 5H4C3.44772 5 3 4.55228 3 4V4Z" fill={stroke || "#FF00AA"}/>
    <path d="M3 8C3 7.44772 3.44772 7 4 7H16C16.5523 7 17 7.44772 17 8V8C17 8.55228 16.5523 9 16 9H4C3.44772 9 3 8.55228 3 8V8Z" fill={stroke || "#FF00AA"}/>
    <path d="M3 12C3 11.4477 3.44772 11 4 11H16C16.5523 11 17 11.4477 17 12V14C17 14.5523 16.5523 15 16 15H4C3.44772 15 3 14.5523 3 14V12Z" fill={stroke || "#FF00AA"}/>
    <path d="M3 19C3 18.4477 3.44772 18 4 18H16C16.5523 18 17 18.4477 17 19V20C17 20.5523 16.5523 21 16 21H4C3.44772 21 3 20.5523 3 20V19Z" fill="#0062FF"/>
  </svg>
);

export default FormIcon;