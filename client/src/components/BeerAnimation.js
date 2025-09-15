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
      window.addEventListener('deviceorientation', handleOrientation);
      setPermissionGranted(true);
    }
  }, [handleOrientation, setPermissionGranted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = []; // RE-INTRODUCED
    let c = 0; // Animation counter for wave

    // Particle object constructor (RE-INTRODUCED)
    function particle(x, y, d) {
      this.x = x;
      this.y = y;
      this.d = d;
      this.respawn = function() {
        // Respawn particles from below the liquid surface
        const baseLiquidY = h - (h - 100) * level / 100 - 50;
        this.x = Math.random() * w; // Random X across full width
        this.y = baseLiquidY + Math.random() * (h - baseLiquidY); // Start between liquid surface and bottom
        this.d = Math.random() * 5 + 5;
      };
    }

    const resizeCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init(); // Re-initialize particles on resize
    };

    // Function to start or restart the animation (RE-INTRODUCED particle init)
    const init = () => {
      c = 0;
      particles = []; // RE-INTRODUCED
      for (let i = 0; i < 40; i++) { // RE-INTRODUCED
        const obj = new particle(0, 0, 0); // RE-INTRODUCED
        obj.respawn(); // RE-INTRODUCED
        particles.push(obj); // RE-INTRODUCED
      }
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
      ctx.rotate(-tiltX * 0.7 * Math.PI / 180); // Counter-rotate for left-right tilt, reduced sensitivity
      ctx.translate(-w / 2, -h / 2); // Move origin back

      const liquidColor = "#f9a825"; // Beer color
      const foamColor = "rgba(255, 255, 255, 0.8)"; // Bubbles color

      // --- Background fill removed as per user request ---

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

      // --- Foam drawing logic removed as per user request ---

      // Draw the bubbles (RE-INTRODUCED, now filled circles, drawn relative to rotated screen)
      ctx.fillStyle = foamColor; // Bubbles are foam-colored and filled
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].d, 0, 2 * Math.PI);
        ctx.fill(); // Filled bubbles
      }

      ctx.restore(); // Restore the un-rotated state

      update();
      animationFrameId.current = window.requestAnimationFrame(draw);
    };

    // Function that updates variables (RE-INTRODUCED particle update)
    const update = () => {
      c++;
      if (100 * Math.PI <= c) c = 0; // Reset counter
      for (let i = 0; i < 40; i++) { // RE-INTRODUCED
        particles[i].x = particles[i].x + Math.random() * 2 - 1; // RE-INTRODUCED
        particles[i].y = particles[i].y - 1; // RE-INTRODUCED
        particles[i].d = particles[i].d - 0.04; // RE-INTRODUCED
        if (particles[i].d <= 0) particles[i].respawn(); // RE-INTRODUCED
      }
    };

    // Device orientation handler
    const handleOrientation = (event) => {
      const gamma = event.gamma; // Left-to-right tilt

      // console.log('Tilt X (gamma):', gamma, 'Tilt Y (beta):', event.beta); // Debugging tilt values

      setTiltX(gamma);
    };

    if (window.DeviceOrientationEvent) {
      requestDeviceOrientationPermission(); // Call the memoized function
    } else {
      console.warn('DeviceOrientationEvent not supported on this browser.');
      setPermissionGranted(false);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial call to set w, h and start animation

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
