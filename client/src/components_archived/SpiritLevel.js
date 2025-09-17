import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SpiritLevel.css';

const SpiritLevel = () => {
  const [rotation, setRotation] = useState(0);
  const [sensorAccess, setSensorAccess] = useState('idle');

  const targetRotation = useRef(0);
  const initialGamma = useRef(null); // To store the initial sensor value for baseline correction
  const filterAlpha = 0.9; // Smoothing factor for the low-pass filter. 0 = no smoothing, 0.99 = very smooth.

  const handleOrientation = useCallback((event) => {
    // event.gamma provides the left-to-right tilt in degrees, ranging from -90 to 90
    if (event.gamma === null) {
      return; // Exit if sensor data is not available
    }

    // On the first run, capture the initial gamma value to use as a baseline (zero point).
    if (initialGamma.current === null) {
      initialGamma.current = event.gamma;
    }

    // Calculate the relative tilt by subtracting the baseline.
    const relativeGamma = event.gamma - initialGamma.current;

    // Set the target for the animation loop. The negative value counteracts the tilt.
    targetRotation.current = relativeGamma;
  }, []);

  const requestSensorPermission = () => {
    // iOS 13+ requires user permission for device orientation events.
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      setSensorAccess('requested');
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            setSensorAccess('granted');
          } else {
            setSensorAccess('denied');
          }
        })
        .catch(() => setSensorAccess('denied'));
    } else {
      // For other browsers/devices, permission is not required.
      setSensorAccess('granted');
    }
  };

  useEffect(() => {
    let animationFrameId;

    // Animation loop to smoothly interpolate to the target rotation
    const updateRotation = () => {
      setRotation(prevRotation => prevRotation * filterAlpha + targetRotation.current * (1 - filterAlpha));
      animationFrameId = requestAnimationFrame(updateRotation);
    };

    if (sensorAccess === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation);
      animationFrameId = requestAnimationFrame(updateRotation);
    }

    // Cleanup function to remove listener and cancel animation frame
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [sensorAccess, handleOrientation]);

  const renderContent = () => {
    switch (sensorAccess) {
      case 'granted':
        return <div className="spirit-level-line" style={{ transform: `rotate(${rotation}deg)` }}></div>;
      case 'denied':
        return <p className="permission-text">Sensor access was denied. Please enable it in your browser settings.</p>;
      case 'requested':
        return <p className="permission-text">Requesting sensor access...</p>;
      case 'idle':
      default:
        return <button onClick={requestSensorPermission} className="permission-button">Activate Spirit Level</button>;
    }
  };

  return (
    <div className="spirit-level-container">
      {renderContent()}
    </div>
  );
};

export default SpiritLevel;
