import React, { useState, useEffect } from 'react';

const BeerAnimation = () => {
  const [tiltX, setTiltX] = useState(0); // For left-right tilt (gamma)
  const [tiltY, setTiltY] = useState(0); // For front-to-back tilt (beta)
  const [isSpilling, setIsSpilling] = useState(false); // New state for spilling

  useEffect(() => {
    const handleOrientation = (event) => {
      const gamma = event.gamma; // Left-to-right tilt
      const beta = event.beta;   // Front-to-back tilt

      // Check for spilling condition
      const spillThreshold = 70; // Degrees
      if (Math.abs(gamma) > spillThreshold || Math.abs(beta) > spillThreshold) {
        if (!isSpilling) { // Only trigger spill once
          setIsSpilling(true);
          // Reset spilling state after a short animation
          setTimeout(() => {
            setIsSpilling(false);
          }, 1000); // Spill animation duration
        }
      }

      // Constrain tilt values to a reasonable range for normal movement
      const newTiltX = Math.max(-45, Math.min(45, gamma));
      const newTiltY = Math.max(-45, Math.min(45, beta));

      setTiltX(newTiltX);
      setTiltY(newTiltY);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isSpilling]); // Re-run effect if isSpilling changes to update event listener logic

  // Calculate dynamic styles for liquid and foam
  const liquidStyle = {
    bottom: `calc(-120% + ${tiltY * 0.5}px)`,
    transform: `translateX(-50%) rotate(${tiltX}deg) skewX(${tiltX * 0.2}deg)`,
    // Add spilling animation
    ...(isSpilling && {
      transform: `translateX(-50%) translateY(100%) rotate(${tiltX}deg) scale(0.8)`,
      opacity: 0,
      transition: 'transform 1s ease-in, opacity 1s ease-in',
    }),
  };

  const foamStyle = {
    transform: `rotate(${tiltX * 0.8}deg) skewX(${tiltX * 0.1}deg)`,
    ...(isSpilling && {
      transform: `translateY(100%) rotate(${tiltX * 0.8}deg) scale(0.8)`,
      opacity: 0,
      transition: 'transform 1s ease-in, opacity 1s ease-in',
    }),
  };

  return (
    <div className="beer-container">
      <div className="beer-liquid" style={liquidStyle}>
        <div className="beer-foam" style={foamStyle}></div>
      </div>
    </div>
  );
};

export default BeerAnimation;
