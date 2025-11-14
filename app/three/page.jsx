// components/IraqStarMap.jsx
'use client'
import { OrbitControls, Sparkles, Stars, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// Wedding information
const WEDDING_INFO = {
  date: 'Friday, December 19, 2025',
  location: 'Basra - Grand Millennium Al Seef Hotel',
  couple: 'Sarah & Ahmed'
}

// Real hotel images from Unsplash (wedding and luxury hotel themed)
const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=800&fit=crop', // Wedding venue
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop', // Luxury hotel
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=800&fit=crop', // Hotel pool
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&h=800&fit=crop', // Event space
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&h=800&fit=crop'  // Banquet hall
]

// Fallback colors for when images fail to load
const FALLBACK_COLORS = [
  '#1e40af', '#dc2626', '#16a34a', '#ca8a04', '#7e22ce'
]

function IraqMap({ position = [0, 0, 0] }) {
  const meshRef = useRef()
  
  const material = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: '#1e3a8a',
      shininess: 120,
      specular: 0x666666,
      emissive: '#1e40af',
      emissiveIntensity: 0.1
    })
  }, [])

  const iraqShape = useMemo(() => {
    const shape = new THREE.Shape()
    
    // More accurate Iraq border coordinates
    shape.moveTo(-1.8, 0.9)    // Northwest
    shape.lineTo(1.7, 0.9)     // Northeast
    shape.lineTo(1.5, -0.8)    // Southeast
    shape.lineTo(-1.5, -0.8)   // Southwest
    shape.lineTo(-1.8, 0.9)    // Back to start
    
    return shape
  }, [])

  const geometry = useMemo(() => {
    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.05,
      bevelSegments: 5
    }
    return new THREE.ExtrudeGeometry(iraqShape, extrudeSettings)
  }, [iraqShape])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.05
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
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
  
  const starPositions = useMemo(() => {
    const positions = []
    const count = 120
    
    for (let i = 0; i < count; i++) {
      const t = i / count
      let x, y
      
      if (t < 0.25) {
        x = THREE.MathUtils.lerp(-2, 2, t * 4)
        y = 1.1
      } else if (t < 0.5) {
        x = 2
        y = THREE.MathUtils.lerp(1.1, -1.1, (t - 0.25) * 4)
      } else if (t < 0.75) {
        x = THREE.MathUtils.lerp(2, -2, (t - 0.5) * 4)
        y = -1.1
      } else {
        x = -2
        y = THREE.MathUtils.lerp(-1.1, 1.1, (t - 0.75) * 4)
      }
      
      positions.push(
        x + (Math.random() - 0.5) * 0.4, 
        y + (Math.random() - 0.5) * 0.4, 
        0.2 + Math.random() * 0.3
      )
    }
    
    return new Float32Array(positions)
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.03
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
          size={0.06}
          color="#ffd700"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      <Sparkles 
        count={80}
        scale={[4.5, 2.8, 2]}
        size={0.15}
        speed={0.15}
        opacity={0.8}
        color="#ffd700"
        noise={0.2}
      />
    </group>
  )
}

function WeddingVenue({ position = [0, 0, 0], visible = true, currentImage, imageIndex }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const [currentTexture, setCurrentTexture] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const materialRef = useRef()

  // Initialize uniforms
  const uniforms = useMemo(() => ({
    uTexture: { value: null },
    uColor: { value: new THREE.Color(FALLBACK_COLORS[imageIndex % FALLBACK_COLORS.length]) },
    uGlowColor: { value: new THREE.Color(0xffd700) },
    uTime: { value: 0 },
    uIntensity: { value: 3 },
    uVisibility: { value: 0 },
    uProgress: { value: 0 },
    uUseTexture: { value: 0 }
  }), [imageIndex])

  useEffect(() => {
    if (visible && currentImage) {
      setLoadError(false)
      const loader = new THREE.TextureLoader()
      loader.load(
        currentImage,
        (texture) => {
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          setCurrentTexture(texture)
          if (materialRef.current) {
            materialRef.current.uniforms.uTexture.value = texture
            materialRef.current.uniforms.uUseTexture.value = 1
          }
        },
        undefined,
        (error) => {
          console.error('Failed to load texture:', error)
          setLoadError(true)
          setCurrentTexture(null)
          if (materialRef.current) {
            materialRef.current.uniforms.uUseTexture.value = 0
          }
        }
      )
    }
  }, [visible, currentImage, imageIndex])

  const material = useMemo(() => {
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float uProgress;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Scale animation
          vec3 pos = position;
          pos.xy *= mix(0.5, 1.0, uProgress);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec3 uColor;
        uniform vec3 uGlowColor;
        uniform float uTime;
        uniform float uIntensity;
        uniform float uVisibility;
        uniform float uProgress;
        uniform float uUseTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec4 finalColor;
          
          if (uUseTexture > 0.5) {
            finalColor = texture2D(uTexture, vUv);
          } else {
            // Use fallback color with pattern
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);
            float pattern = sin(dist * 20.0 - uTime * 3.0) * 0.5 + 0.5;
            finalColor = vec4(uColor * (0.7 + pattern * 0.3), 1.0);
          }
          
          // Golden pulse effect
          float pulse = (sin(uTime * 2.0) * 0.5 + 0.5) * 0.8 + 0.2;
          vec3 glow = uGlowColor * pulse * uIntensity * uVisibility;
          
          // Border glow
          float border = max(
            abs(vUv.x - 0.5) * 2.0,
            abs(vUv.y - 0.5) * 2.0
          );
          border = pow(border, 4.0);
          vec3 borderGlow = uGlowColor * border * pulse * 2.0 * uVisibility;
          
          float alpha = finalColor.a * uVisibility * uProgress;
          vec3 color = mix(finalColor.rgb, finalColor.rgb + glow + borderGlow, uVisibility * 0.3);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true
    })
    
    materialRef.current = shaderMaterial
    return shaderMaterial
  }, [uniforms])

  useFrame((state) => {
    if (materialRef.current && groupRef.current) {
      // Safely update uniforms
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uVisibility.value = visible ? 1 : 0
      
      // Smooth progress animation
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        visible ? 1 : 0,
        0.1
      )
      
      if (visible) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef} material={material}>
        <planeGeometry args={[3.2, 2.2, 32, 32]} />
      </mesh>
      
      {/* Enhanced sparkles */}
      <Sparkles 
        count={50}
        scale={4}
        size={0.2}
        speed={0.3}
        opacity={1}
        color="#ffd700"
        noise={0.4}
      />
      
      {/* Ring of hearts around the venue */}
      <HeartParticles count={20} radius={2.2} visible={visible} />
    </group>
  )
}

function HeartParticles({ count = 20, radius = 2, visible = true }) {
  const heartsRef = useRef()
  
  const heartPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      positions.push(x, y, 0.1)
    }
    return new Float32Array(positions)
  }, [count, radius])

  useFrame((state) => {
    if (heartsRef.current && visible) {
      heartsRef.current.rotation.z = state.clock.elapsedTime * 0.2
      heartsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  return (
    <points ref={heartsRef} visible={visible}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={heartPositions.length / 3}
          array={heartPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ff6b6b"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function FloatingRings({ position = [0, 0, 0] }) {
  const ringsRef = useRef()
  
  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y = state.clock.elapsedTime * 0.1
      ringsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group ref={ringsRef} position={position}>
      {/* Multiple concentric rings */}
      {[1.5, 2, 2.5, 3].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.05, radius, 64]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#ffd700" : "#ffffff"}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function ZoomCamera({ stage, onStageComplete }) {
  const { camera } = useThree()
  const cameraRef = useRef()
  const progress = useRef(0)
  const isAnimating = useRef(false)

  const stages = {
    overview: { position: [0, 0, 8], lookAt: [0, 0, 0] },
    basrah: { position: [0.8, -0.4, 3.5], lookAt: [0.8, -0.4, 0] },
    closeup: { position: [0.8, -0.4, 2.8], lookAt: [0.8, -0.4, 0] }
  }

  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useFrame((state, delta) => {
    if (!isAnimating.current || !cameraRef.current) return

    const currentStage = stages[stage]
    if (!currentStage) return

    const startPos = new THREE.Vector3().copy(cameraRef.current.position)
    const targetPos = new THREE.Vector3(...currentStage.position)

    progress.current = Math.min(progress.current + delta * 1.5, 1)
    
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
    
    for (let i = 0; i < 300; i++) {
      positions.push(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      )
      
      // Wedding colors with gold and romantic tones
      const colorChoices = [
        [1.0, 0.9, 0.1, 0.8], // Gold
        [1.0, 0.3, 0.3, 0.6], // Romantic red
        [1.0, 1.0, 1.0, 0.5], // White
        [0.8, 0.9, 1.0, 0.4], // Light blue
        [1.0, 0.6, 0.8, 0.6]  // Pink
      ]
      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)]
      colors.push(...color)
    }
    
    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1
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
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function WeddingText({ position = [0, 0, 0], visible = true }) {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={position} visible={visible}>
      <Text
        fontSize={0.15}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {WEDDING_INFO.couple}
      </Text>
      <Text
        position={[0, -0.25, 0]}
        fontSize={0.08}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {WEDDING_INFO.date}
      </Text>
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.07}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {WEDDING_INFO.location}
      </Text>
    </group>
  )
}

export default function IraqStarMap() {
  const [stage, setStage] = useState('overview')
  const [mounted, setMounted] = useState(false)
  const [showVenue, setShowVenue] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    // Auto sequence with delays
    const timer1 = setTimeout(() => setStage('basrah'), 4000)
    const timer2 = setTimeout(() => setStage('closeup'), 7000)
    const timer3 = setTimeout(() => setShowVenue(true), 9000)

    // Rotate images every 5 seconds when venue is shown
    let imageInterval
    if (showVenue) {
      imageInterval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % HOTEL_IMAGES.length)
      }, 5000)
    }

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      if (imageInterval) clearInterval(imageInterval)
    }
  }, [showVenue])

  const handleStageComplete = () => {
    if (stage === 'closeup') {
      setShowVenue(true)
    }
  }

  const handleReset = () => {
    setStage('overview')
    setShowVenue(false)
    setCurrentImageIndex(0)
    
    setTimeout(() => {
      setStage('basrah')
    }, 2000)
    setTimeout(() => {
      setStage('closeup')
    }, 5000)
  }

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-red-900 via-black to-green-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Wedding Journey...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-red-900 via-black to-green-900 relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={['#0a0a0a']} />
        
        {/* Enhanced stars */}
        <Stars radius={80} depth={40} count={3000} factor={3} saturation={1} />
        <FloatingParticles />
        
        <fog attach="fog" args={['#0a0a0a', 5, 30]} />
        
        {/* Iraq Map */}
        <IraqMap position={[0, 0, 0]} />
        
        {/* Border Stars */}
        <BorderStars position={[0, 0, 0.1]} />
        
        {/* Wedding Venue with rotating images */}
        <WeddingVenue 
          position={[0.8, -0.4, 0.6]} 
          visible={showVenue}
          currentImage={HOTEL_IMAGES[currentImageIndex]}
          imageIndex={currentImageIndex}
        />
        
        {/* Floating rings around venue */}
        <FloatingRings position={[0.8, -0.4, 0.2]} />
        
        {/* Labels */}
        <Text
          position={[0, 1.3, 0.1]}
          fontSize={0.35}
          color="#ffd700"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Iraq
        </Text>
        
        {/* Wedding information */}
        <WeddingText position={[0.8, -1.2, 0.1]} visible={showVenue} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          maxDistance={15}
          minDistance={2.5}
          enableDamping
          dampingFactor={0.05}
        />
        
        <ZoomCamera stage={stage} onStageComplete={handleStageComplete} />
        
        {/* Enhanced lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
        <pointLight position={[-5, -5, 5]} intensity={0.8} color="#ef4444" />
        <pointLight position={[0, 0, 5]} intensity={1.2} color="#ffffff" />
        
        {/* Special wedding spotlight */}
        <spotLight 
          position={[0.8, -0.4, 3]} 
          intensity={showVenue ? 3 : 0.8} 
          color="#ffd700"
          angle={0.4}
          penumbra={0.6}
          distance={12}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Enhanced central glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/15 rounded-full blur-4xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-green-500/10 rounded-full blur-4xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-160 h-160 bg-yellow-500/5 rounded-full blur-4xl" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
        <button
          onClick={handleReset}
          className="px-8 py-4 bg-white/15 backdrop-blur-lg border-2 border-yellow-500/30 rounded-2xl text-white font-bold cursor-pointer pointer-events-auto transition-all duration-500 hover:bg-white/25 hover:scale-110 hover:border-yellow-500/50 shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/40"
        >
          {stage === 'overview' ? '💫 Begin Wedding Journey' : '🔄 Restart Experience'}
        </button>

        <div className="text-white/80 text-sm bg-black/50 backdrop-blur-md px-6 py-3 rounded-xl border border-yellow-500/20 text-center min-w-80">
          {stage === 'overview' && '🌟 Exploring Iraq - Land of Ancient Civilizations...'}
          {stage === 'basrah' && !showVenue && '🎯 Journey to Basrah - The Venice of the East...'}
          {stage === 'closeup' && !showVenue && '💖 Approaching Wedding Venue...'}
          {showVenue && `✨ ${WEDDING_INFO.couple}'s Wedding - ${WEDDING_INFO.date}`}
        </div>

        {/* Image counter */}
        {showVenue && (
          <div className="text-yellow-200 text-xs bg-black/30 px-3 py-1 rounded-full border border-yellow-500/20">
            Image {currentImageIndex + 1} of {HOTEL_IMAGES.length}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 bg-clip-text text-transparent mb-3">
          Iraq Wedding Journey
        </h1>
        <p className="text-white/70 text-lg">From ancient lands to eternal love</p>
      </div>

      {/* Enhanced Progress */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-3">
          <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
            stage === 'overview' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-green-500'
          }`} />
          <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
            stage === 'basrah' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 
            stage === 'closeup' || showVenue ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
            stage === 'closeup' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 
            showVenue ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
            showVenue ? 'bg-purple-500 shadow-lg shadow-purple-500/50' : 'bg-gray-500'
          }`} />
        </div>
      </div>

      {/* Additional romantic elements */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-yellow-200/60 text-sm animate-pulse">
          {showVenue && '💕 Love Story Unfolding...'}
        </div>
      </div>
    </div>
  )
}