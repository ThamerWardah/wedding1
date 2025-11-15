// components/IraqWeddingMap.jsx
'use client'
import { Line, OrbitControls, Sparkles, Stars, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// Wedding information
const WEDDING_INFO = {
  date: 'Friday, December 19, 2025',
  location: 'Basra - Grand Millennium Al Seef Hotel',
  couple: 'Khaled ❤️ Bayan'
}

// Real hotel images from Unsplash (wedding and luxury hotel themed)
const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop'
]

// Fallback colors for when images fail to load
const FALLBACK_COLORS = [
  '#1e40af', '#dc2626', '#16a34a', '#ca8a04', '#7e22ce'
]

// --- Map Configuration ---
const CENTER_LON = 44.0
const CENTER_LAT = 33.0
const SCALE = 0.18

const normalizePoint = ([lon, lat, z = 0]) => [
  (lon - CENTER_LON) * SCALE,
  (lat - CENTER_LAT) * SCALE,
  z
]

// Enhanced Iraq Border Coordinates
const IRAQ_BORDER_COORDINATES = [
  [38.7923, 33.3787], [39.0, 33.5], [39.5, 33.8], [39.9, 34.2], [40.4, 34.6], [40.8, 35.0], 
  [41.0, 37.1], [42.35, 37.1], [43.15, 37.07], [44.23, 37.07], 
  [44.8, 36.8], [45.1, 36.5], [45.42, 35.98], [45.65, 35.87], 
  [46.15, 35.09], [46.23, 34.75], [45.98, 34.28], [45.72, 33.97], 
  [45.56, 33.10], [46.11, 32.92], [46.60, 32.62], [47.2, 32.3], [47.70, 31.99], 
  [47.85, 31.01], [48.00, 30.01], [48.12, 30.15], [48.16, 30.15], 
  [48.17, 29.93], [48.09, 29.81], [47.97, 29.98], [47.70, 30.09], 
  [47.42, 29.83], [47.30, 30.06], [46.99, 29.83], [46.57, 29.10], 
  [45.56, 29.10], [44.71, 29.18], [44.0, 29.5], [43.0, 30.0], [42.0, 30.5], 
  [41.01, 31.50], [40.40, 31.89], [39.20, 32.16], [38.79, 33.38]
].map(normalizePoint)

// Simplified Rivers (Z-offset for visibility)
const TIGRIS_RIVER_COORDINATES = [
  [42.9, 36.8], [43.2, 35.5], [43.8, 34.5], [44.3, 33.5], 
  [44.5, 33.0], [44.4, 32.2], [44.7, 31.5], [45.0, 31.0], 
  [45.8, 30.5], [46.2, 30.3], [47.2, 30.5] 
].map(p => normalizePoint([p[0], p[1], 0.01])) 

const EUPHRATES_RIVER_COORDINATES = [
  [38.7, 34.8], [39.5, 34.0], [40.5, 33.5], [41.5, 33.0], 
  [42.5, 32.5], [43.5, 32.0], [44.5, 31.0], [45.5, 30.5], 
  [46.5, 30.0], [47.2, 30.5] 
].map(p => normalizePoint([p[0], p[1], 0.01])) 

// Basra Wedding Location Coordinates (Grand Millennium Hotel)
const BASRA_WEDDING_LOCATION = normalizePoint([47.81, 30.52, 0.03])

// Camera positions for different views
const MAP_VIEW = {
  position: [0, 0, 6],
  target: [0, 0, 0]
}

const VENUE_VIEW = {
  position: [BASRA_WEDDING_LOCATION[0] + 2, BASRA_WEDDING_LOCATION[1] + 1, 4],
  target: [BASRA_WEDDING_LOCATION[0], BASRA_WEDDING_LOCATION[1], 0.5]
}

// Deep Space Stars - Far away for realistic space feel
function DeepSpaceStars() {
  const starsRef = useRef()
  const { viewport } = useThree()

  const stars = useMemo(() => {
    const positions = []
    const colors = []
    const sizes = []
    
    for (let i = 0; i < 8000; i++) {
      // Create a large sphere of distant stars
      const radius = 200 + Math.random() * 500
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      positions.push(x, y, z)
      
      // Realistic star colors
      const starType = Math.random()
      if (starType < 0.6) {
        colors.push(1, 1, 0.9) // Yellow-white
      } else if (starType < 0.8) {
        colors.push(0.7, 0.8, 1) // Blue-white
      } else if (starType < 0.9) {
        colors.push(1, 0.8, 0.6) // Orange
      } else {
        colors.push(1, 0.6, 0.6) // Red
      }
      
      // Very small sizes for distant stars
      sizes.push((0.1 + Math.random() * 0.3))
    }
    
    return { positions, colors, sizes }
  }, [])

  useFrame((state) => {
    if (starsRef.current) {
      // Extremely subtle movement for realism
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.001
    }
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={stars.positions.length / 3}
          array={new Float32Array(stars.positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={stars.colors.length / 3}
          array={new Float32Array(stars.colors)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

// Shooting stars for dynamic effect
function ShootingStars() {
  const shootingStarsRef = useRef()
  
  const stars = useMemo(() => {
    const positions = []
    const velocities = []
    
    for (let i = 0; i < 8; i++) {
      // Start from random positions
      const startX = (Math.random() - 0.5) * 200
      const startY = (Math.random() - 0.5) * 200
      const startZ = 100 + Math.random() * 50
      
      positions.push(startX, startY, startZ)
      
      // Random velocity
      velocities.push(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        -1 - Math.random() * 1
      )
    }
    
    return { positions, velocities }
  }, [])

  useFrame((state) => {
    if (shootingStarsRef.current) {
      const positions = shootingStarsRef.current.geometry.attributes.position.array
      const velocities = stars.velocities
      
      for (let i = 0; i < stars.positions.length / 3; i++) {
        const idx = i * 3
        
        // Update position based on velocity
        positions[idx] += velocities[idx]
        positions[idx + 1] += velocities[idx + 1]
        positions[idx + 2] += velocities[idx + 2]
        
        // Reset star if it goes too far
        if (positions[idx + 2] < -50) {
          positions[idx] = (Math.random() - 0.5) * 200
          positions[idx + 1] = (Math.random() - 0.5) * 200
          positions[idx + 2] = 150 + Math.random() * 50
        }
      }
      
      shootingStarsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={shootingStarsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={stars.positions.length / 3}
          array={new Float32Array(stars.positions)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        color="#ffffff"
        transparent
        opacity={0.9}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

// Enhanced Wedding Marker
function WeddingMarker({ position, onClick, isActive }) {
  const markerRef = useRef()
  const pulseRef = useRef()

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.rotation.y = state.clock.elapsedTime * 0.8
      markerRef.current.position.z = 0.05 + Math.sin(state.clock.elapsedTime * 4) * 0.03
    }
    
    if (pulseRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.3
      pulseRef.current.scale.set(scale, scale, 1)
      pulseRef.current.material.opacity = 0.5 - Math.sin(state.clock.elapsedTime * 5) * 0.2
    }
  })

  return (
    <group 
      position={position} 
      onClick={onClick} 
      onPointerOver={() => document.body.style.cursor = 'pointer'} 
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* Pulsating glow */}
      <mesh ref={pulseRef} position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 32]} />
        <meshBasicMaterial 
          color={isActive ? "#00FFFF" : "#FFD700"}
          transparent 
          opacity={0.4} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main crystal marker */}
      <mesh ref={markerRef}>
        <coneGeometry args={[0.06, 0.3, 4]} /> 
        <meshStandardMaterial 
          color={isActive ? "#00FFFF" : "#FFD700"}
          emissive={isActive ? "#00FFFF" : "#FFD700"} 
          emissiveIntensity={2} 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Sparkles around marker */}
      <Sparkles 
        count={15}
        scale={[0.5, 0.5, 0.5]}
        size={0.05}
        speed={0.1}
        opacity={1}
        color={isActive ? "#00FFFF" : "#FFD700"}
      />
    </group>
  )
}

// Simple Image Display Component
function ImageDisplay({ position, imageUrl, isVisible, imageIndex }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const [texture, setTexture] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (isVisible && imageUrl) {
      const loader = new THREE.TextureLoader()
      loader.load(
        imageUrl,
        (loadedTexture) => {
          setTexture(loadedTexture)
          setLoadError(false)
        },
        undefined,
        () => {
          setLoadError(true)
          setTexture(null)
        }
      )
    }
  }, [isVisible, imageUrl])

  useFrame((state) => {
    if (groupRef.current && isVisible) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  if (!isVisible) return null

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        <planeGeometry args={[3.2, 2.2]} />
        <meshBasicMaterial 
          map={texture}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          color={loadError ? FALLBACK_COLORS[imageIndex % FALLBACK_COLORS.length] : '#ffffff'}
        />
      </mesh>
      
      {/* Border effect */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.01]}>
        <ringGeometry args={[1.62, 1.7, 32]} />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <Sparkles 
        count={30}
        scale={[4, 3, 2]}
        size={0.1}
        speed={0.2}
        opacity={0.8}
        color="#ffd700"
      />
    </group>
  )
}

// Enhanced Iraq Map
function IraqiMap({ onMarkerClick, showVenue }) {
  const groupRef = useRef()
  const iraqBorder = useMemo(() => IRAQ_BORDER_COORDINATES, [])

  useFrame((state) => {
    if (groupRef.current && !showVenue) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      
      {/* Iraq Border Outline - Made thinner */}
      <Line
        points={iraqBorder}
        color="#00FFFF" 
        lineWidth={2} // Reduced from 4 to 2 for thinner border
        transparent
        opacity={0.9}
      />
      
      {/* Iraq Fill Area */}
      <mesh position={[0, 0, -0.01]}>
        <shapeGeometry args={[new THREE.Shape(iraqBorder.map(([x, y]) => new THREE.Vector2(x, y)))]} />
        <meshStandardMaterial 
          color="#050520"
          emissive="#0011FF"
          emissiveIntensity={0.5} 
          transparent 
          opacity={0.4} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rivers */}
      <Line points={TIGRIS_RIVER_COORDINATES} color="#38BDF8" lineWidth={3} transparent opacity={0.7} />
      <Line points={EUPHRATES_RIVER_COORDINATES} color="#1D4ED8" lineWidth={3} transparent opacity={0.7} />

      {/* Wedding Location Marker */}
      <WeddingMarker 
        position={BASRA_WEDDING_LOCATION} 
        onClick={onMarkerClick}
        isActive={showVenue}
      />

      {/* Country labels */}
      <Text position={[0, 1.8, 0.1]} fontSize={0.3} color="#FFD700" anchorX="center" anchorY="middle" fontWeight="bold">
        IRAQ
      </Text>
      
      <Text position={[0, 1.4, 0.1]} fontSize={0.15} color="#FEF3C7" anchorX="center" anchorY="middle">
        Khaled ❤️ Bayan
      </Text>
    </group>
  )
}

// Wedding Information Display
function WeddingInfoDisplay({ position, visible }) {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.03
    }
  })

  return (
    <group ref={groupRef} position={position} visible={visible}>
      <Text
        fontSize={0.12}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        Khaled ❤️ Bayan
      </Text>
      <Text
        position={[0, -0.22, 0]}
        fontSize={0.06}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {WEDDING_INFO.date}
      </Text>
      <Text
        position={[0, -0.35, 0]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        textAlign="center"
      >
        {WEDDING_INFO.location}
      </Text>
    </group>
  )
}

// Camera Controller for smooth transitions
function CameraController({ isVenueView, onTransitionComplete }) {
  const { camera, controls } = useThree()
  const progress = useRef(0)
  const isAnimating = useRef(false)

  useEffect(() => {
    isAnimating.current = true
    progress.current = 0
  }, [isVenueView])

  useFrame((state, delta) => {
    if (!isAnimating.current) return

    const targetView = isVenueView ? VENUE_VIEW : MAP_VIEW
    const currentView = isVenueView ? MAP_VIEW : VENUE_VIEW

    progress.current = Math.min(progress.current + delta * 1.5, 1)
    
    // Smooth easing
    const easeOut = 1 - Math.pow(1 - progress.current, 3)
    
    // Interpolate camera position
    camera.position.lerpVectors(
      new THREE.Vector3(...currentView.position),
      new THREE.Vector3(...targetView.position),
      easeOut
    )
    
    // Interpolate camera target
    const target = new THREE.Vector3(...targetView.target)
    const currentTarget = new THREE.Vector3(...currentView.target)
    const lookAtTarget = currentTarget.lerp(target, easeOut)
    
    camera.lookAt(lookAtTarget)

    if (progress.current >= 1) {
      isAnimating.current = false
      onTransitionComplete?.()
    }
  })

  return null
}

// Floating Navigation Interface
function FloatingNavigation({ currentImageIndex, totalImages, onNext, onPrev, onToggleView, showVenue }) {
  if (!showVenue) return null

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/40 shadow-2xl">
        <div className="flex items-center justify-between gap-6 mb-3">
          <button 
            className="px-4 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 rounded-lg text-cyan-200 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
            onClick={onPrev}
          >
            ◀ Prev
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-yellow-300 text-sm font-semibold">
              {currentImageIndex + 1} / {totalImages}
            </span>
            <span className="text-cyan-300 text-xs mt-1">
              Khaled ❤️ Bayan
            </span>
          </div>
          
          <button 
            className="px-4 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 rounded-lg text-cyan-200 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
            onClick={onNext}
          >
            Next ▶
          </button>
        </div>
        
        <button 
          className="w-full py-2 bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/60 hover:to-pink-600/60 border border-purple-400/50 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          onClick={onToggleView}
        >
          🌍 Back to Map
        </button>
      </div>
    </div>
  )
}

export default function IraqWeddingMap() {
  const [mounted, setMounted] = useState(false)
  const [showVenue, setShowVenue] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [timeUntilNextImage, setTimeUntilNextImage] = useState(20)
  const controlsRef = useRef()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-rotate images every 20 seconds when in venue view
  useEffect(() => {
    if (!showVenue || isTransitioning) return

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % HOTEL_IMAGES.length)
      setTimeUntilNextImage(20) // Reset countdown
    }, 20000) // 20 seconds

    return () => clearInterval(interval)
  }, [showVenue, isTransitioning])

  // Countdown timer for image rotation
  useEffect(() => {
    if (!showVenue || isTransitioning) return

    const countdown = setInterval(() => {
      setTimeUntilNextImage(prev => {
        if (prev <= 1) return 20
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdown)
  }, [showVenue, isTransitioning])

  const handleMarkerClick = (e) => {
    e.stopPropagation() 
    setIsTransitioning(true)
    setShowVenue(true)
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % HOTEL_IMAGES.length)
    setTimeUntilNextImage(20) // Reset countdown when manually navigating
  }

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + HOTEL_IMAGES.length) % HOTEL_IMAGES.length)
    setTimeUntilNextImage(20) // Reset countdown when manually navigating
  }

  const handleToggleView = () => {
    setIsTransitioning(true)
    setShowVenue(false)
  }

  const handleTransitionComplete = () => {
    setIsTransitioning(false)
  }

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Khaled ❤️ Bayan's Wedding Journey...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <Canvas 
        camera={{ 
          position: MAP_VIEW.position,
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Enhanced Space Environment */}
        <DeepSpaceStars />
        <ShootingStars />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        
        <fog attach="fog" args={['#000011', 10, 100]} />
        
        {/* Iraq Map */}
        <IraqiMap onMarkerClick={handleMarkerClick} showVenue={showVenue} />
        
        {/* Image Display */}
        <ImageDisplay 
          position={[BASRA_WEDDING_LOCATION[0], BASRA_WEDDING_LOCATION[1], 0.5]} 
          imageUrl={HOTEL_IMAGES[currentImageIndex]}
          isVisible={showVenue}
          imageIndex={currentImageIndex}
        />
        
        {/* Wedding Information */}
        <WeddingInfoDisplay 
          position={[BASRA_WEDDING_LOCATION[0], BASRA_WEDDING_LOCATION[1] - 1.2, 0.1]} 
          visible={showVenue} 
        />
        
        {/* Camera Controller */}
        <CameraController 
          isVenueView={showVenue} 
          onTransitionComplete={handleTransitionComplete}
        />
        
        {/* Orbit Controls for full 3D navigation */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={showVenue ? 3 : 4}
          maxDistance={showVenue ? 8 : 15}
          autoRotate={!showVenue && !isTransitioning}
          autoRotateSpeed={0.5}
          rotateSpeed={0.8}
          zoomSpeed={1.2}
        />
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#ef4444" />
        
        {/* Dynamic spotlight */}
        <spotLight 
          position={[
            BASRA_WEDDING_LOCATION[0], 
            BASRA_WEDDING_LOCATION[1], 
            showVenue ? 4 : 8
          ]} 
          intensity={showVenue ? 2 : 0.5} 
          color="#ffd700"
          angle={0.3}
          penumbra={0.5}
          distance={15}
        />
      </Canvas>

      {/* Cosmic Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-4xl" />
      </div>

      {/* Elegant Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-200 to-purple-300 mb-3">
          Khaled ❤️ Bayan
        </h1>
        <p className="text-white/80 text-lg mb-1">{WEDDING_INFO.date}</p>
        <p className="text-white/60 text-md">{WEDDING_INFO.location}</p>
      </div>

      {/* Wedding Invitation Text */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-transparent rounded-2xl p-6 max-w-2xl">
          <p className="text-white/90 text-sm leading-relaxed mb-4 font-light">
            We are honored to invite you to share our special day.
          </p>
          <p className="text-white/80 text-sm leading-relaxed mb-4 font-light">
            The wedding ceremony will begin at 7:00 PM on Friday, December 19, 2025, 
            at the Grand Millennium Al Seef Basra, followed by dinner at 8:30 PM.
          </p>
          <p className="text-white/90 text-sm leading-relaxed font-light">
            Your presence means so much to us, and we look forward to celebrating 
            this beautiful evening together.
          </p>
        </div>
      </div>

      {/* Interactive Guide */}
      {showVenue && (
        <div className="absolute top-48 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-cyan-500/30 max-w-sm">
            <p className="text-cyan-300 text-sm font-semibold mb-2">
              ✨ Venue Gallery
            </p>
            <p className="text-white/70 text-xs mb-2">
              Images auto-rotate every 20s • Use buttons to navigate
            </p>
            <p className="text-yellow-300 text-xs font-medium animate-pulse">
              🕐 Next image in {timeUntilNextImage}s
            </p>
          </div>
        </div>
      )}

      {/* Floating Navigation */}
      <FloatingNavigation 
        currentImageIndex={currentImageIndex}
        totalImages={HOTEL_IMAGES.length}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
        onToggleView={handleToggleView}
        showVenue={showVenue}
      />

      {/* Loading Transition */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-lg animate-pulse">
            {showVenue ? '✨ Zooming to Venue...' : '🌍 Returning to Map...'}
          </div>
        </div>
      )}
    </div>
  )
}