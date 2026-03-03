import React from 'react';

/**
 * Airbnb-style 5-star rating picker.
 * @param {number} value - Current rating (1-5)
 * @param {function} onChange - Called with new value when user selects
 * @param {boolean} readOnly - If true, shows stars without interaction
 */
const StarRating = ({ value = 0, onChange, readOnly = false }) => {
  const [hover, setHover] = React.useState(0);
  const display = hover || value;

  const handleClick = (n) => {
    if (!readOnly && onChange) onChange(n);
  };

  return (
    <div className="flex gap-0.5" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => handleClick(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          disabled={readOnly}
          className={`p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg
            className={`w-7 h-7 ${
              n <= display ? 'text-amber-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
