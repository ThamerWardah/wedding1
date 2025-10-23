// components/SimpleRain.jsx
'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SimpleRain() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false // Disable antialias for better performance
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 10;

    // Create rain with lines (better performance)
    const rainLines = [];
    const rainCount = 1500;

    // Wedding color palette
    const colors = [
      0xFFD700, // Gold
      0xff6b6b, // Romantic pink
      0x4ecdc4, // Blue
      0x8B4513, // Brown
      0xffffff, // White
    ];

    for (let i = 0; i < rainCount; i++) {
      // Create line geometry for rain drops
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0.5, 0,   // Top
        0, -0.5, 0   // Bottom
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

      const material = new THREE.LineBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0.1 + Math.random() * 0.3,
        linewidth: 1
      });

      const line = new THREE.Line(geometry, material);
      
      // Random positions
      line.position.x = (Math.random() - 0.5) * 50;
      line.position.y = (Math.random() - 0.5) * 40 + 20;
      line.position.z = (Math.random() - 0.5) * 30;

      // Random properties
      line.userData = {
        speed: 0.5 + Math.random() * 2,
        length: 0.2 + Math.random() * 0.8,
        swing: Math.random() * 0.03
      };

      // Scale for different lengths
      line.scale.y = line.userData.length;

      scene.add(line);
      rainLines.push(line);
    }

    // Simple lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      rainLines.forEach((line, index) => {
        // Move downward
        line.position.y -= line.userData.speed * 0.2;
        
        // Gentle swing
        line.position.x += Math.sin(Date.now() * 0.001 + index) * line.userData.swing;
        
        // Reset when below screen
        if (line.position.y < -20) {
          line.position.y = 20;
          line.position.x = (Math.random() - 0.5) * 50;
        }

        // Twinkling effect
        line.material.opacity = 0.1 + Math.sin(Date.now() * 0.005 + index) * 0.2;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none z-[200]"
      style={{ 
        mixBlendMode: 'plus-lighter', // Creates nice blending
        background: 'transparent'
      }}
    />
  );
}