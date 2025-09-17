import React, { useState, useEffect } from 'react';
import './SpiritLevel.css';

const SpiritLevel = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleOrientation = (event) => {
      // We'll use the 'gamma' value for left-to-right tilt.
      // The range is -90 to 90.
      const gamma = event.gamma;
      setRotation(gamma);
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
