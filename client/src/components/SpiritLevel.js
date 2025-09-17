import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SpiritLevel.css';

const SpiritLevel = () => {
  const [rotation, setRotation] = useState(0);
  const [sensorAccess, setSensorAccess] = useState('idle');
  const [debugLog, setDebugLog] = useState([]);

  const targetRotation = useRef(0);
  const filterAlpha = 0.9;

  const addLog = (message) => {
    setDebugLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleDeviceMotion = useCallback((event) => {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && acceleration.x !== null && acceleration.z !== null) {
      const roll = Math.atan2(acceleration.x, acceleration.z);
      const rollDegrees = roll * (180 / Math.PI);
      targetRotation.current = -rollDegrees;
      addLog(`[Sensor] Target: ${targetRotation.current.toFixed(2)}`);
    }
  }, []);

  const requestSensorPermission = () => {
    addLog('Requesting permission...');
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      setSensorAccess('requested');
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            addLog('Permission granted!');
            setSensorAccess('granted'); // State change will trigger useEffect
          } else {
            addLog('Permission denied.');
            setSensorAccess('denied');
          }
        })
        .catch(error => {
          addLog(`Permission error: ${error.message}`);
          setSensorAccess('denied');
        });
    } else {
      addLog('No permission needed.');
      setSensorAccess('granted'); // State change will trigger useEffect
    }
  };

  useEffect(() => {
    let animationFrameId;
    const updateRotation = () => {
      setRotation(prevRotation => prevRotation * filterAlpha + targetRotation.current * (1 - filterAlpha));
      animationFrameId = requestAnimationFrame(updateRotation);
    };

    if (sensorAccess === 'granted') {
      addLog('[Effect] Granted: Adding listener and starting loop.');
      window.addEventListener('devicemotion', handleDeviceMotion);
      animationFrameId = requestAnimationFrame(updateRotation);
    }

    // Cleanup function runs when component unmounts or sensorAccess changes
    return () => {
      // No need to check sensorAccess here, this cleanup is tied to the effect
      // that runs only when granted. But to be safe, we can check if listener was added.
      addLog('[Effect] Cleaning up listener and animation.');
      window.removeEventListener('devicemotion', handleDeviceMotion);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [sensorAccess, handleDeviceMotion]); // Re-run effect if sensorAccess changes

  const renderContent = () => {
    switch (sensorAccess) {
      case 'granted':
        return <div className="spirit-level-line" style={{ transform: `rotate(${rotation}deg)` }}></div>;
      case 'denied':
        return <p className="permission-text">Sensor access was denied.</p>;
      case 'requested':
        return <p className="permission-text">Requesting sensor access...</p>;
      case 'idle':
      default:
        return <button onClick={requestSensorPermission} className="permission-button">Activate Spirit Level</button>;
    }
  };

  return (
    <>
      <div className="spirit-level-container">{renderContent()}</div>
      <pre className="debug-log">{debugLog.join('\n')}</pre>
    </>
  );
};

export default SpiritLevel;