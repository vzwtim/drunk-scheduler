import React, { useState, useEffect, useRef } from 'react';
import './SpiritLevel.css';

const SpiritLevel = () => {
  const [rotation, setRotation] = useState(0);
  const initialGamma = useRef(null); // useRef to store the initial gamma

  useEffect(() => {
    const handleOrientation = (event) => {
      if (initialGamma.current === null) {
        initialGamma.current = event.gamma;
      }
      // We'll use the 'gamma' value for left-to-right tilt.
      // The range is -90 to 90.
      const gamma = event.gamma;
      const relativeGamma = gamma - initialGamma.current;
      setRotation(-relativeGamma);
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div className="spirit-level-container">
      <div className="spirit-level-line" style={{ transform: `rotate(${rotation}deg)` }}></div>
    </div>
  );
};

export default SpiritLevel;