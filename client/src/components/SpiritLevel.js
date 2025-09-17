import React, { useState, useEffect, useCallback } from 'react';
import './SpiritLevel.css';

const SpiritLevel = () => {
  const [rotation, setRotation] = useState(0);
  const [sensorAccess, setSensorAccess] = useState('idle'); // idle, requested, granted, denied

  const handleDeviceMotion = useCallback((event) => {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && acceleration.x !== null && acceleration.z !== null) {
      // Calculate roll (rotation around Z-axis, which corresponds to left-right tilt)
      // We use atan2(x, z) to get the angle in radians
      const roll = Math.atan2(acceleration.x, acceleration.z);
      
      // Convert radians to degrees
      const rollDegrees = roll * (180 / Math.PI);
      
      // We set the negative value to counteract the device's tilt
      setRotation(-rollDegrees);
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
      // For non-iOS 13+ devices that don't require explicit permission
      setSensorAccess('granted');
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
  };

  useEffect(() => {
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [handleDeviceMotion]);

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