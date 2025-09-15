import React, { useRef, useEffect, useState, useCallback } from 'react';

const BeerAnimation = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [level] = useState(50); // Initial liquid level (0-100), now fixed
  const [tiltX, setTiltX] = useState(0); // For left-right tilt (gamma)
  const [permissionGranted, setPermissionGranted] = useState(false); // New state for permission

  // Device orientation handler
  const handleOrientation = useCallback((event) => {
    const gamma = event.gamma; // Left-to-right tilt

    // console.log('Tilt X (gamma):', gamma, 'Tilt Y (beta):', event.beta); // Debugging tilt values

    setTiltX(gamma);
  }, []);

  // Define requestDeviceOrientationPermission outside useEffect
  const requestDeviceOrientationPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setPermissionGranted(true);
        } else {
          console.warn('Device orientation permission denied.');
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        setPermissionGranted(false);
      }
    } else {
      // This branch is for browsers that support DeviceOrientationEvent but don't require explicit permission (e.g., Android Chrome)
      window.addEventListener('deviceorientation', handleOrientation);
      setPermissionGranted(true);
    }
  }, [handleOrientation, setPermissionGranted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let c = 0; // Animation counter for wave

    const resizeCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
      init(); // Call init after resize
    };

    const init = () => {
      c = 0;
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = window.requestAnimationFrame(draw);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // --- Apply counter-rotation for liquid surface ---
      ctx.save(); // Save the un-rotated state
      ctx.translate(w / 2, h / 2); // Move origin to center of canvas
      // Reduce sensitivity of tiltX
      ctx.rotate(-tiltX * 0.5 * Math.PI / 180); // Counter-rotate for left-right tilt, FURTHER reduced sensitivity
      ctx.translate(-w / 2, -h / 2); // Move origin back

      const liquidColor = "#f9a825"; // Beer color
      const foamColor = "rgba(255, 255, 255, 0.8)"; // Foam color

      // Calculate liquid surface based on level (now fixed)
      const baseLiquidY = h - (h - 100) * level / 100 - 50; // Adjusted for fuller look
      const waveAmplitude = 32; // Increased wave height for thicker surface
      const waveFrequency = 0.05; // How fast the wave oscillates

      // Draw the liquid (now drawn relative to the rotated context)
      ctx.fillStyle = liquidColor; // Ensure fillStyle is liquidColor for the main liquid shape
      ctx.beginPath();
      ctx.moveTo(0, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency));
      ctx.bezierCurveTo(
        w / 3, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + Math.PI / 2),
        2 * w / 3, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + Math.PI),
        w, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + 3 * Math.PI / 2)
      );
      ctx.lineTo(w, h * 1.5); // Extend liquid bottom beyond canvas
      ctx.lineTo(0, h * 1.5); // Extend liquid bottom beyond canvas
      ctx.closePath();
      ctx.fill();

      // Draw the foam layer (RE-INTRODUCED and thickened)
      ctx.fillStyle = foamColor;
      ctx.beginPath();
      const foamOffset = 50; // MUCH thicker foam
      ctx.moveTo(0, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency) - foamOffset);
      ctx.bezierCurveTo(
        w / 3, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + Math.PI / 2) - foamOffset,
        2 * w / 3, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + Math.PI) - foamOffset,
        w, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + 3 * Math.PI / 2) - foamOffset
      );
      ctx.lineTo(w, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + 3 * Math.PI / 2));
      ctx.lineTo(0, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency));
      ctx.closePath();
      ctx.fill();

      ctx.restore(); // Restore the un-rotated state

      update();
      animationFrameId.current = window.requestAnimationFrame(draw);
    };

    const update = () => {
      c++;
      if (100 * Math.PI <= c) c = 0; // Reset counter
    };

    // Initial setup
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial call to set w, h and start animation

    if (window.DeviceOrientationEvent) {
      // If permission function exists, we'll rely on the button click.
      // If not, but API is supported, add listener directly.
      if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
        window.addEventListener('deviceorientation', handleOrientation);
        setPermissionGranted(true); // Assume granted if no explicit request needed
      }
      // If requestPermission function exists, the button will handle calling requestDeviceOrientationPermission
    } else {
      console.warn('DeviceOrientationEvent not supported on this browser.');
      setPermissionGranted(false);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (window.DeviceOrientationEvent && permissionGranted) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [level, permissionGranted, requestDeviceOrientationPermission, handleOrientation, tiltX]);

  return (
    <>
      {!permissionGranted && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function' && (
        <button
          onClick={requestDeviceOrientationPermission}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid black',
            cursor: 'pointer',
          }}
        >
          センサーを有効にする
        </button>
      )}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }} />
    </>
  );
};

export default BeerAnimation;
