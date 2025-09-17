import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SpiritLevel.css';

const SpiritLevel = () => {
  const [rotation, setRotation] = useState(0);
  const [sensorAccess, setSensorAccess] = useState('idle');
  const [debugLog, setDebugLog] = useState([]); // State for on-screen debug log

  const targetRotation = useRef(0);
  const filterAlpha = 0.9;

  // Helper to add a log entry to the screen
  const addLog = (message) => {
    // Keep the last 5 entries
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
            setSensorAccess('granted');
            window.addEventListener('devicemotion', handleDeviceMotion);
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
      setSensorAccess('granted');
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
  };

  useEffect(() => {
    let animationFrameId;

    const updateRotation = () => {
      setRotation(prevRotation => {
        const newRotation = prevRotation * filterAlpha + targetRotation.current * (1 - filterAlpha);
        return newRotation;
      });
      animationFrameId = requestAnimationFrame(updateRotation);
    };

    if (sensorAccess === 'granted') {
      addLog('[Effect] Starting animation loop.');
      animationFrameId = requestAnimationFrame(updateRotation);
    }

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
        return <p className="permission-text">Sensor access was denied.</p>;
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
    <>
      <div className="spirit-level-container">
        {renderContent()}
      </div>
      <pre className="debug-log">
        {debugLog.join('\n')}
      </pre>
    </>
  );
};

export default SpiritLevel;
