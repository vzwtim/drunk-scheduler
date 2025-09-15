import React, { useRef, useEffect, useState } from 'react';

const BeerAnimation = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [level] = useState(50); // Initial liquid level (0-100), now fixed
  const [tiltX, setTiltX] = useState(0); // For left-right tilt (gamma)
  const [tiltY, setTiltY] = useState(0); // For front-to-back tilt (beta)

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    let c = 0; // Animation counter for wave

    // Particle object constructor (adapted from user's code)
    function particle(x, y, d) {
      this.x = x;
      this.y = y;
      this.d = d;
      this.respawn = function() {
        // Respawn particles from the bottom of the canvas
        this.x = Math.random() * w; // Random X across full width
        this.y = h + Math.random() * 20; // Start below the canvas, with some randomness
        this.d = Math.random() * 5 + 5;
      };
    }

    const resizeCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init(); // Re-initialize particles on resize
    };

    // Function to start or restart the animation
    const init = () => {
      c = 0;
      particles = [];
      for (let i = 0; i < 40; i++) {
        const obj = new particle(0, 0, 0);
        obj.respawn();
        particles.push(obj);
      }
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = window.requestAnimationFrame(draw);
    };

    // Function that draws into the canvas in a loop
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const liquidColor = "#f9a825"; // Beer color
      const foamColor = "rgba(255, 255, 255, 0.8)"; // Foam color

      // Calculate liquid surface based on level and tilt
      const baseLiquidY = h - (h - 100) * level / 100 - 50; // Adjusted for fuller look
      const waveAmplitude = 8; // Reduced wave height for less wildness
      const waveFrequency = 0.05; // How fast the wave oscillates
      const tiltInfluenceX = tiltX * 0.2; // Reduced tilt influence
      const tiltInfluenceY = tiltY * 0.2; // Reduced tilt influence

      // Draw the liquid
      ctx.fillStyle = liquidColor;
      ctx.beginPath();
      ctx.moveTo(0, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX) + tiltInfluenceY);
      ctx.bezierCurveTo(
        w / 3, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX + Math.PI / 2) + tiltInfluenceY,
        2 * w / 3, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX + Math.PI) + tiltInfluenceY,
        w, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX + 3 * Math.PI / 2) + tiltInfluenceY
      );
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Draw the foam layer slightly above the liquid
      ctx.fillStyle = foamColor;
      ctx.beginPath();
      const foamOffset = 5; // Foam sits slightly above liquid
      ctx.moveTo(0, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX) + tiltInfluenceY - foamOffset);
      ctx.bezierCurveTo(
        w / 3, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX + Math.PI / 2) + tiltInfluenceY - foamOffset,
        2 * w / 3, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX + Math.PI) + tiltInfluenceY - foamOffset,
        w, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX + 3 * Math.PI / 2) + tiltInfluenceY - foamOffset
      );
      ctx.lineTo(w, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX + 3 * Math.PI / 2) + tiltInfluenceY);
      ctx.lineTo(0, baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + tiltInfluenceX) + tiltInfluenceY);
      ctx.closePath();
      ctx.fill();

      // Draw the bubbles
      ctx.strokeStyle = foamColor; // Bubbles are foam-colored
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].d, 0, 2 * Math.PI);
        ctx.stroke(); // Hollow bubbles
      }

      update();
      animationFrameId.current = window.requestAnimationFrame(draw);
    };

    // Function that updates variables
    const update = () => {
      c++;
      if (100 * Math.PI <= c) c = 0; // Reset counter
      for (let i = 0; i < 40; i++) {
        particles[i].x = particles[i].x + Math.random() * 2 - 1;
        particles[i].y = particles[i].y - 1;
        particles[i].d = particles[i].d - 0.04;
        if (particles[i].d <= 0) particles[i].respawn();
      }
    };

    // Device orientation handler
    const handleOrientation = (event) => {
      const gamma = event.gamma; // Left-to-right tilt
      const beta = event.beta;   // Front-to-back tilt

      // Spilling logic (no automatic level change)
      // The level is now fixed at 50, but tilt still influences wave

      setTiltX(gamma); // Use raw gamma for wave effect
      setTiltY(beta);  // Use raw beta for wave effect
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial setup

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [level, tiltX, tiltY]); // Re-run effect if level or tilt changes

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }} />
  );
};

export default BeerAnimation;
