// components/IraqStarMap.jsx
'use client'
import { OrbitControls, Sparkles, Stars, Text, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

function IraqMap({ position = [0, 0, 0] }) {
  const meshRef = useRef()
  const iraqTexture = useTexture('https://images.unsplash.com/photo-1589330273594-fade1ee91647?w=800&h=600&fit=crop')
  
  // Iraq country shape points (simplified)
  const iraqShape = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Simplified Iraq border coordinates (normalized)
    shape.moveTo(-1.5, 0.8)    // Northwest
    shape.lineTo(1.5, 0.8)     // Northeast
    shape.lineTo(1.2, -0.7)    // Southeast
    shape.lineTo(-1.2, -0.7)   // Southwest
    shape.lineTo(-1.5, 0.8)    // Back to start
    
    return shape
  }, [])

  const geometry = useMemo(() => {
    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.04,
      bevelSegments: 3
    }
    return new THREE.ExtrudeGeometry(iraqShape, extrudeSettings)
  }, [iraqShape])

  const material = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      map: iraqTexture,
      shininess: 100,
      specular: 0x444444
    })
  }, [iraqTexture])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </group>
  )
}

function BorderStars({ position = [0, 0, 0] }) {
  const groupRef = useRef()
  
  // Star positions along Iraq border
  const starPositions = useMemo(() => {
    const positions = []
    const count = 80
    
    // Create stars along a rectangular border (simplified Iraq shape)
    for (let i = 0; i < count; i++) {
      const t = i / count
      let x, y
      
      if (t < 0.25) {
        // Top border
        x = THREE.MathUtils.lerp(-1.8, 1.8, t * 4)
        y = 1
      } else if (t < 0.5) {
        // Right border
        x = 1.8
        y = THREE.MathUtils.lerp(1, -1, (t - 0.25) * 4)
      } else if (t < 0.75) {
        // Bottom border
        x = THREE.MathUtils.lerp(1.8, -1.8, (t - 0.5) * 4)
        y = -1
      } else {
        // Left border
        x = -1.8
        y = THREE.MathUtils.lerp(-1, 1, (t - 0.75) * 4)
      }
      
      positions.push(x + (Math.random() - 0.5) * 0.3, y + (Math.random() - 0.5) * 0.3, 0.2)
    }
    
    return new Float32Array(positions)
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  return (
    <group position={position} ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#60a5fa"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
      <Sparkles 
        count={50}
        scale={[4, 2.5, 1]}
        size={0.1}
        speed={0.1}
        opacity={0.6}
        color="#3b82f6"
      />
    </group>
  )
}

function BasrahImage({ position = [0, 0, 0], visible = true }) {
  const meshRef = useRef()
  const basrahTexture = useTexture('https://images.unsplash.com/photo-1589330273594-fade1ee91647?w=600&h=400&fit=crop')
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: basrahTexture },
        uGlowColor: { value: new THREE.Color(0xf59e0b) },
        uTime: { value: 0 },
        uIntensity: { value: 2.5 },
        uVisibility: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec3 uGlowColor;
        uniform float uTime;
        uniform float uIntensity;
        uniform float uVisibility;
        varying vec2 vUv;
        
        void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
          vec3 glow = uGlowColor * pulse * uIntensity * uVisibility;
          
          // Only show when visible
          float alpha = texColor.a * uVisibility;
          vec3 finalColor = mix(texColor.rgb, texColor.rgb + glow, uVisibility);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    })
  }, [basrahTexture])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
      meshRef.current.material.uniforms.uVisibility.value = visible ? 1 : 0
      
      if (visible) {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} material={material} scale={[0, 0, 0]}>
        <planeGeometry args={[2.5, 1.8, 32, 32]} />
      </mesh>
      <Sparkles 
        count={30}
        scale={3}
        size={0.15}
        speed={0.2}
        opacity={0.8}
        color="#f59e0b"
        noise={0.3}
      />
    </group>
  )
}

function ZoomCamera({ stage, onStageComplete }) {
  const { camera } = useThree()
  const cameraRef = useRef(camera)
  const progress = useRef(0)
  const isAnimating = useRef(false)

  // Camera positions for different stages
  const stages = {
    overview: { position: [0, 0, 8], lookAt: [0, 0, 0] },
    basrah: { position: [0.5, -0.3, 4], lookAt: [0.5, -0.3, 0] }
  }

  useFrame((state, delta) => {
    if (!isAnimating.current) return

    const currentStage = stages[stage]
    const startPos = new THREE.Vector3().copy(cameraRef.current.position)
    const targetPos = new THREE.Vector3(...currentStage.position)

    progress.current = Math.min(progress.current + delta * 1.2, 1)
    
    // Smooth easing
    const easeOut = 1 - Math.pow(1 - progress.current, 3)
    
    cameraRef.current.position.lerpVectors(startPos, targetPos, easeOut)
    cameraRef.current.lookAt(...currentStage.lookAt)

    if (progress.current >= 1) {
      isAnimating.current = false
      onStageComplete?.()
    }
  })

  useEffect(() => {
    isAnimating.current = true
    progress.current = 0
  }, [stage])

  return null
}

function FloatingParticles() {
  const particlesRef = useRef()
  
  const particles = useMemo(() => {
    const positions = []
    const colors = []
    
    for (let i = 0; i < 200; i++) {
      positions.push(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      )
      
      // Iraq flag colors (red, white, black, green)
      const colorChoices = [
        [0.8, 0.1, 0.1, 0.6], // Red
        [1.0, 1.0, 1.0, 0.4], // White
        [0.1, 0.1, 0.1, 0.5], // Black
        [0.1, 0.6, 0.1, 0.6]  // Green
      ]
      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)]
      colors.push(...color)
    }
    
    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={new Float32Array(particles.positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 4}
          array={new Float32Array(particles.colors)}
          itemSize={4}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

export default function IraqStarMap() {
  const [stage, setStage] = useState('overview')
  const [mounted, setMounted] = useState(false)
  const [showBasrah, setShowBasrah] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Auto sequence: Overview → Zoom to Basrah → Show Basrah image
    const timer1 = setTimeout(() => {
      setStage('basrah')
    }, 3000)

    const timer2 = setTimeout(() => {
      setShowBasrah(true)
    }, 5000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const handleStageComplete = () => {
    if (stage === 'basrah') {
      setShowBasrah(true)
    }
  }

  const handleReset = () => {
    setStage('overview')
    setShowBasrah(false)
    
    setTimeout(() => {
      setStage('basrah')
    }, 2000)
  }

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-red-900 via-black to-green-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Iraq Map...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-red-900 via-black to-green-900 relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={['#0a0a0a']} />
        <Stars radius={60} depth={30} count={2000} factor={2} saturation={0.8} />
        <FloatingParticles />
        
        <fog attach="fog" args={['#0a0a0a', 5, 25]} />
        
        {/* Iraq Map */}
        <IraqMap position={[0, 0, 0]} />
        
        {/* Border Stars */}
        <BorderStars position={[0, 0, 0.1]} />
        
        {/* Basrah Image (Southern Iraq) */}
        <BasrahImage position={[0.5, -0.3, 0.5]} visible={showBasrah} />
        
        {/* Labels */}
        <Text
          position={[0, 1.2, 0.1]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Iraq
        </Text>
        
        {showBasrah && (
          <Text
            position={[0.5, -0.8, 0.1]}
            fontSize={0.2}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
          >
            Basrah
          </Text>
        )}
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          maxDistance={15}
          minDistance={3}
          enableDamping
          dampingFactor={0.05}
        />
        
        <ZoomCamera stage={stage} onStageComplete={handleStageComplete} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#ef4444" />
        <pointLight position={[0, 0, 5]} intensity={1.0} color="#ffffff" />
        
        {/* Special spotlight on Basrah */}
        <spotLight 
          position={[0.5, -0.3, 3]} 
          intensity={showBasrah ? 2 : 0.5} 
          color="#f59e0b"
          angle={0.3}
          penumbra={0.5}
          distance={10}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central Glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
        <button
          onClick={handleReset}
          className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold cursor-pointer pointer-events-auto transition-all duration-500 hover:bg-white/20 hover:scale-105 hover:border-white/30 shadow-2xl shadow-red-500/20 hover:shadow-red-500/30"
        >
          {stage === 'overview' ? '🗺️ Explore Iraq' : '🔄 Restart Journey'}
        </button>

        <div className="text-white/70 text-sm bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 text-center">
          {stage === 'overview' && '🌟 Exploring Iraq Border Stars...'}
          {stage === 'basrah' && !showBasrah && '🎯 Zooming to Basrah...'}
          {showBasrah && '✨ Welcome to Basrah - The Pearl of the South!'}
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-red-200 via-white to-green-200 bg-clip-text text-transparent mb-2">
          Iraq Star Map
        </h1>
        <p className="text-white/60 text-sm">From border stars to Basrah's beauty</p>
      </div>

      {/* Progress */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-2">
          <div className={`w-3 h-3 rounded-full ${stage === 'overview' ? 'bg-red-500' : 'bg-green-500'}`} />
          <div className={`w-3 h-3 rounded-full ${stage === 'basrah' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
          <div className={`w-3 h-3 rounded-full ${showBasrah ? 'bg-blue-500' : 'bg-gray-500'}`} />
        </div>
      </div>
    </div>
  )
}