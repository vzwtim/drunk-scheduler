import React, { useRef, useEffect, useState, useCallback } from 'react';

const BeerAnimation = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [level] = useState(50); // Initial liquid level (0-100), now fixed

  // Use useRef for particles to persist across renders without causing re-renders
  const particlesRef = useRef([]); // RE-INTRODUCED

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let c = 0; // Animation counter for wave

    // Particle object constructor (RE-INTRODUCED)
    function particle(x, y, d) {
      this.x = x;
      this.y = y;
      this.d = d;
      this.respawn = function() {
        const baseLiquidY = h - (h - 100) * level / 100 - 50;
        this.x = Math.random() * w; // Random X across full width
        this.y = baseLiquidY + Math.random() * (h - baseLiquidY); // Start between liquid surface and bottom
        this.d = Math.random() * 5 + 5;
      };
    }

    const resizeCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      c = 0;
      particlesRef.current = []; // Use particlesRef.current
      // for (let i = 0; i < 40; i++) {
      //   const obj = new particle(0, 0, 0);
      //   obj.respawn();
      //   particlesRef.current.push(obj);
      // }
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
      // ctx.rotate(-tiltX * 0.5 * Math.PI / 180); // REMOVED THIS LINE
      ctx.translate(-w / 2, -h / 2); // Move origin back

      const liquidColor = "#f9a825"; // Beer color
      const bubbleColor = "rgba(255, 255, 255, 0.8)"; // Bubbles color

      // Calculate liquid surface based on level (now fixed)
      const baseLiquidY = h - (h - 100) * level / 100 - 50; // Adjusted for fuller look
      const waveAmplitude = 32; // Increased wave height for thicker surface
      const waveFrequency = 0.05; // How fast the wave oscillates

      // Draw the liquid (now drawn relative to the rotated context)
      ctx.fillStyle = liquidColor; // Ensure fillStyle is liquidColor for the main liquid shape
      ctx.beginPath();
      const startY = baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency);
      const endY = baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + Math.PI);
      const controlY = baseLiquidY + waveAmplitude * Math.sin(c * waveFrequency + Math.PI / 2);
      ctx.moveTo(0, startY);
      ctx.quadraticCurveTo(w / 2, controlY, w, endY);
      ctx.lineTo(w, h * 1.5); // Extend liquid bottom beyond canvas
      ctx.lineTo(0, h * 1.5); // Extend liquid bottom beyond canvas
      ctx.closePath();
      ctx.fill();

      // Draw the foam layer (RE-INTRODUCED and thickened)
      ctx.fillStyle = bubbleColor; // Using bubbleColor for foam
      ctx.beginPath();
      const foamOffset = 50; // MUCH thicker foam
      ctx.moveTo(0, startY - foamOffset);
      ctx.quadraticCurveTo(w / 2, controlY - foamOffset, w, endY - foamOffset);
      ctx.lineTo(w, endY);
      ctx.lineTo(0, startY);
      ctx.closePath();
      ctx.fill();

      ctx.restore(); // Restore the un-rotated state

      // Draw the bubbles (RE-INTRODUCED, now filled circles, drawn relative to UN-ROTATED screen)
      // ctx.fillStyle = bubbleColor; // Bubbles are foam-colored and filled
      // for (let i = 0; i < 40; i++) {
      //   ctx.beginPath();
      //   ctx.arc(particlesRef.current[i].x, particlesRef.current[i].y, particlesRef.current[i].d, 0, 2 * Math.PI); // Use particlesRef.current
      //   ctx.fill(); // Filled bubbles
      // }

      update();
      animationFrameId.current = window.requestAnimationFrame(draw);
    };

    const update = () => {
      c++;
      if (100 * Math.PI <= c) c = 0; // Reset counter
      // for (let i = 0; i < 40; i++) {
      //   particlesRef.current[i].x = particlesRef.current[i].x + Math.random() * 2 - 1; // Use particlesRef.current
      //   particlesRef.current[i].y = particlesRef.current[i].y - 1; // Use particlesRef.current
      //   particlesRef.current[i].d = particlesRef.current[i].d - 0.04; // Use particlesRef.current
      //   if (particlesRef.current[i].d <= 0) particlesRef.current[i].respawn(); // Use particlesRef.current
      // }
    };

    // Initial setup
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial call to set w, h and start animation

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [level]);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }} />
    </>
  );
};

export default BeerAnimation;
