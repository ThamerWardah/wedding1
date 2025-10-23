// components/CanvasTree.jsx
'use client';
import { useEffect, useRef } from 'react';

export default function CanvasTree() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let animationFrame;
    let startTime = Date.now();
    const duration = 3000; // 3 seconds

    const drawTree = (progress) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Interpolate from black to green
      const greenValue = Math.min(255, Math.floor(progress * 255));
      const color = `rgb(0, ${greenValue}, 0)`;
      
      // Draw trunk (stays brown)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(95, 250, 10, -50);
      
      // Draw leaves with animated color
      ctx.fillStyle = color;
      
      // Tree layers
      drawTriangle(ctx, 50, 200, 150, 200, 100, 50);
      drawTriangle(ctx, 60, 150, 140, 150, 100, 30);
      drawTriangle(ctx, 70, 120, 130, 120, 100, 20);
    };

    const drawTriangle = (ctx, x1, y1, x2, y2, x3, y3) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      drawTree(progress);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    // Start with black and white
    ctx.filter = 'grayscale(100%)';
    drawTree(0);
    
    // Remove filter and start animation after 2 seconds
    setTimeout(() => {
      ctx.filter = 'none';
      startTime = Date.now();
      animate();
    }, 2000);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <canvas 
        ref={canvasRef} 
        width={200} 
        height={300}
        className="border border-gray-200 rounded-lg"
      />
    </div>
  );
}