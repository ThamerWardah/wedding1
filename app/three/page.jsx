// components/IraqWeddingMap.jsx
'use client'
import { Line, OrbitControls, Sparkles, Stars, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// Wedding information
const WEDDING_INFO = {
  date: 'الجمعة، 19 ديسمبر 2025',
  location: 'البصرة - فندق جراند ميلينيوم السيف',
  couple: 'خالد ❤️ بيان'
}

// Real hotel images from Unsplash (wedding and luxury hotel themed)
const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop'
]

// Couple photos
const COUPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop', // Couple smiling
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop', // Romantic couple
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop', // Couple laughing
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop', // Bride portrait
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

// Simplified Rivers
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

// Basra Wedding Location Coordinates
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

// Fixed Magical Particle System
function MagicalParticles({ count = 2000, isVenueView = false }) {
  const pointsRef = useRef()
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const range = isVenueView ? 30 : 100
      
      positions[i3] = (Math.random() - 0.5) * range
      positions[i3 + 1] = (Math.random() - 0.5) * range
      positions[i3 + 2] = (Math.random() - 0.5) * range
      
      const color = new THREE.Color()
      color.setHSL(
        Math.random() * 0.2 + 0.5,
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5
      )
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [count, isVenueView])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isVenueView ? 0.05 : 0.1}
        vertexColors
        transparent
        opacity={isVenueView ? 0.4 : 0.6}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// Fixed Floating Hearts Animation
function FloatingHearts({ isVenueView = false }) {
  const heartsRef = useRef()
  
  const hearts = useMemo(() => {
    const count = isVenueView ? 20 : 50
    const positions = []
    const scales = []
    
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * (isVenueView ? 15 : 20),
        Math.random() * (isVenueView ? 8 : 10) + 2,
        (Math.random() - 0.5) * (isVenueView ? 15 : 20)
      )
      scales.push(Math.random() * 0.3 + 0.1)
    }
    
    return { positions, scales }
  }, [isVenueView])

  useFrame((state) => {
    if (heartsRef.current) {
      heartsRef.current.children.forEach((heart, i) => {
        heart.position.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.01
        heart.rotation.z = Math.sin(state.clock.elapsedTime * 3 + i) * 0.1
        heart.scale.setScalar(hearts.scales[i] + Math.sin(state.clock.elapsedTime * 4 + i) * 0.05)
      })
    }
  })

  return (
    <group ref={heartsRef}>
      {hearts.positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#ff6b6b" : "#ffd700"} 
            transparent 
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

// Fixed Deep Space Stars
function DeepSpaceStars({ isVenueView = false }) {
  const starsRef = useRef()

  const { positions, colors } = useMemo(() => {
    const count = isVenueView ? 3000 : 8000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = isVenueView ? 100 + Math.random() * 200 : 200 + Math.random() * 500
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      const starType = Math.random()
      if (starType < 0.6) {
        colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 0.9
      } else if (starType < 0.8) {
        colors[i3] = 0.7; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1
      } else if (starType < 0.9) {
        colors[i3] = 1; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.6
      } else {
        colors[i3] = 1; colors[i3 + 1] = 0.6; colors[i3 + 2] = 0.6
      }
    }
    
    return { positions, colors }
  }, [isVenueView])

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.001
    }
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
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

// Fixed Shooting Stars
function ShootingStars({ isVenueView = false }) {
  const shootingStarsRef = useRef()
  const positionsRef = useRef()
  
  const { initialPositions, velocities } = useMemo(() => {
    const count = isVenueView ? 4 : 8
    const initialPositions = new Float32Array(count * 3)
    const velocities = []
    const range = isVenueView ? 100 : 200
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      initialPositions[i3] = (Math.random() - 0.5) * range
      initialPositions[i3 + 1] = (Math.random() - 0.5) * range
      initialPositions[i3 + 2] = 50 + Math.random() * (isVenueView ? 25 : 50)
      
      velocities.push(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        -1 - Math.random() * 1
      )
    }
    
    return { initialPositions, velocities }
  }, [isVenueView])

  useFrame((state) => {
    if (shootingStarsRef.current && positionsRef.current) {
      const positions = positionsRef.current.array
      const count = isVenueView ? 4 : 8
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const vIndex = i * 3
        
        positions[i3] += velocities[vIndex]
        positions[i3 + 1] += velocities[vIndex + 1]
        positions[i3 + 2] += velocities[vIndex + 2]
        
        if (positions[i3 + 2] < -50) {
          const range = isVenueView ? 100 : 200
          positions[i3] = (Math.random() - 0.5) * range
          positions[i3 + 1] = (Math.random() - 0.5) * range
          positions[i3 + 2] = 75 + Math.random() * (isVenueView ? 25 : 50)
        }
      }
      
      positionsRef.current.needsUpdate = true
    }
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={positionsRef}
          attach="attributes-position"
          count={initialPositions.length / 3}
          array={initialPositions}
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
  const [isHovered, setIsHovered] = useState(false)

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

  const handleClick = (e) => {
    e.stopPropagation()
    onClick(e)
  }

  return (
    <group 
      position={position} 
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
        setIsHovered(true)
      }} 
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
        setIsHovered(false)
      }}
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
          color={isHovered ? "#00FFFF" : (isActive ? "#00FFFF" : "#FFD700")}
          emissive={isHovered ? "#00FFFF" : (isActive ? "#00FFFF" : "#FFD700")} 
          emissiveIntensity={isHovered ? 3 : 2}
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

// Enhanced Image Display Component
function ImageDisplay({ position, imageUrl, isVisible, imageIndex, isCouplePhoto = false }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const frameRef = useRef()
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
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    }
    
    if (frameRef.current) {
      frameRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02
    }
  })

  if (!isVisible) return null

  const frameWidth = isCouplePhoto ? 3.5 : 3.2
  const frameHeight = isCouplePhoto ? 2.5 : 2.2
  const frameThickness = isCouplePhoto ? 0.15 : 0.1

  return (
    <group ref={groupRef} position={position}>
      {/* Thick Ornate Frame */}
      <group ref={frameRef}>
        <mesh position={[0, 0, -frameThickness/2]}>
          <boxGeometry args={[frameWidth, frameHeight, frameThickness]} />
          <meshStandardMaterial
            color="#ffd700"
            metalness={0.9}
            roughness={0.1}
            emissive="#ffd700"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Ornate corners */}
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y], i) => (
          <mesh key={i} position={[
            x * (frameWidth/2 - 0.1),
            y * (frameHeight/2 - 0.1),
            frameThickness/2 + 0.01
          ]}>
            <sphereGeometry args={[0.15, 8, 6]} />
            <meshStandardMaterial
              color="#ff6b6b"
              metalness={0.8}
              roughness={0.2}
              emissive="#ff6b6b"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Image */}
      <mesh ref={meshRef} position={[0, 0, 0.02]}>
        <planeGeometry args={[frameWidth - 0.3, frameHeight - 0.3]} />
        <meshBasicMaterial 
          map={texture}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          color={loadError ? FALLBACK_COLORS[imageIndex % FALLBACK_COLORS.length] : '#ffffff'}
        />
      </mesh>
      
      {/* Magical glow around image */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.01]}>
        <ringGeometry args={[frameWidth/2 - 0.1, frameWidth/2, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Enhanced Sparkles */}
      <Sparkles 
        count={50}
        scale={[frameWidth + 0.5, frameHeight + 0.5, 1]}
        size={0.1}
        speed={0.3}
        opacity={1}
        color={isCouplePhoto ? "#ff6b6b" : "#ffd700"}
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
      {/* Iraq Border Outline */}
      <Line
        points={iraqBorder}
        color="#00FFFF" 
        lineWidth={2}
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
        العراق
      </Text>
      
      <Text position={[0, 1.4, 0.1]} fontSize={0.15} color="#FEF3C7" anchorX="center" anchorY="middle">
        خالد ❤️ بيان
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
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={position} visible={visible}>
      {/* Background plate */}
      <mesh position={[0, -0.15, -0.01]}>
        <planeGeometry args={[2, 0.8]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <Text
        fontSize={0.12}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        خالد ❤️ بيان
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
  const { camera } = useThree()
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
    
    const easeOut = 1 - Math.pow(1 - progress.current, 3)
    
    camera.position.lerpVectors(
      new THREE.Vector3(...currentView.position),
      new THREE.Vector3(...targetView.position),
      easeOut
    )
    
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

// Custom Orbit Controls
function CustomOrbitControls({ isVenueView, isTransitioning }) {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    const controls = controlsRef.current
    if (controls) {
      if (isVenueView) {
        controls.minDistance = 2
        controls.maxDistance = 10
        controls.maxPolarAngle = Math.PI
        controls.enablePan = false
      } else {
        controls.minDistance = 4
        controls.maxDistance = 15
        controls.maxPolarAngle = Math.PI
        controls.enablePan = true
      }
    }
  }, [isVenueView])

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enabled={!isTransitioning}
      autoRotate={!isVenueView && !isTransitioning}
      autoRotateSpeed={0.5}
      rotateSpeed={0.8}
      zoomSpeed={1.2}
    />
  )
}

// Floating Navigation Interface
function FloatingNavigation({ currentImageIndex, totalImages, onNext, onPrev, onToggleView, showVenue, showCouplePhotos }) {
  if (!showVenue) return null

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/40 shadow-2xl">
        <div className="flex items-center justify-between gap-6 mb-3">
          <button 
            className="px-4 py-2 bg-cyan-600/40 hover:bg-cyan-600/60 border border-cyan-400/60 rounded-lg text-cyan-100 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
            onClick={onPrev}
          >
            ◀ السابق
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-yellow-200 text-sm font-semibold">
              {currentImageIndex + 1} / {totalImages}
            </span>
            <span className="text-cyan-200 text-xs mt-1">
              {showCouplePhotos ? 'خالد ❤️ بيان' : 'فندق جراند ميلينيوم'}
            </span>
          </div>
          
          <button 
            className="px-4 py-2 bg-cyan-600/40 hover:bg-cyan-600/60 border border-cyan-400/60 rounded-lg text-cyan-100 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
            onClick={onNext}
          >
            التالي ▶
          </button>
        </div>
        
        <div className="flex gap-2 mb-2">
          <button 
            className={`flex-1 py-2 border rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
              !showCouplePhotos 
                ? 'bg-cyan-600/60 border-cyan-400 text-cyan-100' 
                : 'bg-cyan-600/20 border-cyan-400/30 text-cyan-200/70'
            }`}
            onClick={() => onToggleView('hotel')}
          >
            🏨 الفندق
          </button>
          <button 
            className={`flex-1 py-2 border rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
              showCouplePhotos 
                ? 'bg-pink-600/60 border-pink-400 text-pink-100' 
                : 'bg-pink-600/20 border-pink-400/30 text-pink-200/70'
            }`}
            onClick={() => onToggleView('couple')}
          >
            💑 العروسين
          </button>
        </div>
        
        <button 
          className="w-full py-2 bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-600/70 hover:to-pink-600/70 border border-purple-400/60 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          onClick={() => onToggleView('map')}
        >
          🌍 العودة إلى الخريطة
        </button>
      </div>
    </div>
  )
}

// Control Instructions Component
function ControlInstructions({ showVenue }) {
  if (!showVenue) return null

  return (
    <div className="absolute top-20 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/40 z-40">
    </div>
  )
}

export default function IraqWeddingMap() {
  const [mounted, setMounted] = useState(false)
  const [showVenue, setShowVenue] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showCouplePhotos, setShowCouplePhotos] = useState(false)
  const [interactionLock, setInteractionLock] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-rotate images
  useEffect(() => {
    if (!showVenue || isTransitioning || interactionLock) return

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const currentImages = showCouplePhotos ? COUPLE_PHOTOS : HOTEL_IMAGES
        return (prev + 1) % currentImages.length
      })
    }, 20000)

    return () => clearInterval(interval)
  }, [showVenue, isTransitioning, showCouplePhotos, interactionLock])

  const handleMarkerClick = (e) => {
    if (interactionLock || showVenue) return
    e.stopPropagation() 
    setIsTransitioning(true)
    setShowVenue(true)
    setInteractionLock(true)
    setTimeout(() => setInteractionLock(false), 2000)
  }

  const handleNextImage = () => {
    if (interactionLock) return
    setInteractionLock(true)
    const currentImages = showCouplePhotos ? COUPLE_PHOTOS : HOTEL_IMAGES
    setCurrentImageIndex(prev => (prev + 1) % currentImages.length)
    setTimeout(() => setInteractionLock(false), 500)
  }

  const handlePrevImage = () => {
    if (interactionLock) return
    setInteractionLock(true)
    const currentImages = showCouplePhotos ? COUPLE_PHOTOS : HOTEL_IMAGES
    setCurrentImageIndex(prev => (prev - 1 + currentImages.length) % currentImages.length)
    setTimeout(() => setInteractionLock(false), 500)
  }

  const handleToggleView = (viewType) => {
    if (interactionLock) return
    
    setInteractionLock(true)
    
    if (viewType === 'map') {
      setIsTransitioning(true)
      setShowVenue(false)
    } else if (viewType === 'hotel') {
      setShowCouplePhotos(false)
      setCurrentImageIndex(0)
    } else if (viewType === 'couple') {
      setShowCouplePhotos(true)
      setCurrentImageIndex(0)
    }
    
    setTimeout(() => {
      setIsTransitioning(false)
      setInteractionLock(false)
    }, 1500)
  }

  const handleTransitionComplete = () => {
    setIsTransitioning(false)
  }

  const currentImages = showCouplePhotos ? COUPLE_PHOTOS : HOTEL_IMAGES
  const currentImageUrl = currentImages[currentImageIndex]

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">جاري تحميل رحلة زفاف خالد ❤️ بيان...</div>
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
        onClick={(e) => {
          if (showVenue || isTransitioning) {
            e.stopPropagation()
          }
        }}
        onPointerMissed={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Enhanced Space Environment */}
        <DeepSpaceStars isVenueView={showVenue} />
        <ShootingStars isVenueView={showVenue} />
        <Stars radius={showVenue ? 50 : 100} depth={showVenue ? 25 : 50} count={showVenue ? 2000 : 5000} factor={4} saturation={0} fade />
        
        {/* Magical Elements */}
        <MagicalParticles isVenueView={showVenue} />
        <FloatingHearts isVenueView={showVenue} />
        
        <fog attach="fog" args={['#000011', 10, 100]} />
        
        {/* Iraq Map */}
        <IraqiMap onMarkerClick={handleMarkerClick} showVenue={showVenue} />
        
        {/* Image Display */}
        <group position={[BASRA_WEDDING_LOCATION[0], BASRA_WEDDING_LOCATION[1], 0.5]}>
          <ImageDisplay 
            position={[0, 0, 0]} 
            imageUrl={currentImageUrl}
            isVisible={showVenue}
            imageIndex={currentImageIndex}
            isCouplePhoto={showCouplePhotos}
          />
        </group>
        
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
        
        {/* Custom Orbit Controls */}
        <CustomOrbitControls 
          isVenueView={showVenue}
          isTransitioning={isTransitioning}
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
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-200 to-purple-300 mb-2">
          خالد ❤️ بيان
        </h1>
        <p className="text-white/80 text-sm mb-1">{WEDDING_INFO.date}</p>
        <p className="text-white/60 text-xs">{WEDDING_INFO.location}</p>
      </div>

      {/* Wedding Invitation Text */}
      <div className="absolute top-28 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
        <div className="bg-transparent rounded-2xl p-4 max-w-xl">
          <p className="text-white/90 text-xs leading-relaxed mb-3 font-light">
            يشرفنا دعوتكم للمشاركة في يومنا الخاص.
          </p>
          <p className="text-white/80 text-xs leading-relaxed mb-3 font-light">
            ستبدأ مراسم الزفاف الساعة 7:00 مساءً يوم الجمعة، 19 ديسمبر 2025، 
            في فندق جراند ميلينيوم السيف البصرة، يليها العشاء الساعة 8:30 مساءً.
          </p>
          <p className="text-white/90 text-xs leading-relaxed font-light">
            حضوركم يعني الكثير بالنسبة لنا، ونحن نتطلع للاحتفال معكم في هذا المساء الجميل.
          </p>
        </div>
      </div>

      {/* Control Instructions */}
      <ControlInstructions showVenue={showVenue} />

      {/* Floating Navigation */}
      <FloatingNavigation 
        currentImageIndex={currentImageIndex}
        totalImages={currentImages.length}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
        onToggleView={handleToggleView}
        showVenue={showVenue}
        showCouplePhotos={showCouplePhotos}
      />

      {/* Loading Transition */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-lg animate-pulse">
            {showVenue ? '✨ جاري التكبير إلى مكان الحفل...' : '🌍 العودة إلى الخريطة...'}
          </div>
        </div>
      )}

      {/* Interactive Hint */}
      {!showVenue && !isTransitioning && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-white/60 text-sm animate-pulse">
            💫 انقر على المؤشر الذهبي لاكتشاف مفاجآت سحرية
          </p>
        </div>
      )}

      {/* View Mode Indicator */}
      {showVenue && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-cyan-500/40">
          <span className="text-cyan-200 text-sm font-medium">
            {showCouplePhotos ? '💑 عرض العروسين' : '🏨 عرض الفندق'}
          </span>
        </div>
      )}
    </div>
  )
}