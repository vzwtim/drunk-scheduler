import React, { useState, useEffect } from 'react';

const BeerAnimation = () => {
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    const handleOrientation = (event) => {
      // event.gamma is the left-to-right tilt in degrees, where right is positive
      const gamma = event.gamma;
      
      // Let's constrain the tilt to a reasonable range, e.g., -45 to 45 degrees
      const newTilt = Math.max(-45, Math.min(45, gamma));
      setTilt(newTilt);
    };

    // Check for browser support
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const liquidStyle = {
    // The transform origin should be the center of the liquid
    transformOrigin: 'center',
    // We apply a rotation and also move the liquid up/down to simulate it sloshing
    transform: `translateX(-50%) translateY(-50%) rotate(${tilt}deg)`,
  };

  return (
    <div className="beer-container">
      <div className="beer-liquid" style={liquidStyle}>
        <div className="beer-foam"></div>
      </div>
    </div>
  );
};

export default BeerAnimation;
