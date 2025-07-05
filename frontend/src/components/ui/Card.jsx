import React from 'react';

function Card({ children, className = '', padding = 'p-6', shadow = 'shadow', rounded = 'rounded-lg' }) {
  return (
    <div className={`bg-white ${shadow} ${rounded} ${padding} ${className}`}>
      {children}
    </div>
  );
}

export default Card;