import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SpiritLevel.css';

const SpiritLevel = () => {
  const [rotation, setRotation] = useState(0);
  const [sensorAccess, setSensorAccess] = useState('idle'); // idle, requested, granted, denied

  // Ref to store the raw rotation calculated from the sensor
  const targetRotation = useRef(0);

  // Low-pass filter alpha. Closer to 1 means smoother but more lag.
  const filterAlpha = 0.9;

  const handleDeviceMotion = useCallback((event) => {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && acceleration.x !== null && acceleration.z !== null) {
      const roll = Math.atan2(acceleration.x, acceleration.z);
      const rollDegrees = roll * (180 / Math.PI);
      
      // Update the target rotation. We set the negative value to counteract the tilt.
      targetRotation.current = -rollDegrees;
    }
  }, []);

  const requestSensorPermission = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      setSensorAccess('requested');
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            setSensorAccess('granted');
            window.addEventListener('devicemotion', handleDeviceMotion);
          } else {
            setSensorAccess('denied');
          }
        })
        .catch(error => {
          console.error('DeviceMotionEvent permission error:', error);
          setSensorAccess('denied');
        });
    } else {
      setSensorAccess('granted');
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
  };

  useEffect(() => {
    let animationFrameId;

    // Animation loop to smoothly update the rotation
    const updateRotation = () => {
      // Apply the low-pass filter
      setRotation(prevRotation => prevRotation * filterAlpha + targetRotation.current * (1 - filterAlpha));
      animationFrameId = requestAnimationFrame(updateRotation);
    };

    if (sensorAccess === 'granted') {
      animationFrameId = requestAnimationFrame(updateRotation);
    }

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [sensorAccess, handleDeviceMotion]);

  const renderContent = () => {
    switch (sensorAccess) {
      case 'granted':
        return (
          <div className="spirit-level-line" style={{ transform: `rotate(${rotation}deg)` }}></div>
        );
      case 'denied':
        return <p className="permission-text">Sensor access was denied. Please enable it in your browser settings.</p>;
      case 'requested':
        return <p className="permission-text">Requesting sensor access...</p>;
      case 'idle':
      default:
        return (
          <button onClick={requestSensorPermission} className="permission-button">
            Activate Spirit Level
          </button>
        );
    }
  };

  return (
    <div className="spirit-level-container">
      {renderContent()}
    </div>
  );
};

export default SpiritLevel;
