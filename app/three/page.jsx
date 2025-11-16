// components/IraqWeddingMap.jsx
'use client'
import { Line, OrbitControls, Sparkles, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// Wedding information
const WEDDING_INFO = {
  date: 'الجمعة، 19 ديسمبر 2025',
  location: 'البصرة - فندق جراند ميلينيوم السيف',
  couple: 'خالد ❤️ بيار'
}

// Real hotel images from Unsplash
const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop'
]

// Couple photos
const COUPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop',
]

// Fallback colors
const FALLBACK_COLORS = [
  '#1e40af', '#dc2626', '#16a34a', '#ca8a04', '#7e22ce'
]

// Map Configuration
const CENTER_LON = 44.0
const CENTER_LAT = 33.0
const SCALE = 0.15 // Slightly smaller for mobile

const normalizePoint = ([lon, lat, z = 0]) => [
  (lon - CENTER_LON) * SCALE,
  (lat - CENTER_LAT) * SCALE,
  z
]

// Iraq Border Coordinates
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

// Rivers
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

// Basra Wedding Location
const BASRA_WEDDING_LOCATION = normalizePoint([47.81, 30.52, 0.03])

// Camera positions - optimized for mobile
const MAP_VIEW = {
  position: [0, 0, 5],
  target: [0, 0, 0]
}

const VENUE_VIEW_BOTH = {
  position: [0, 0, 10],
  target: [0, 0, 0]
}

// Frame positions - diagonal arrangement for mobile
const HOTEL_POSITION = [-1.2, 1.2, -0.2]    // Top-left
const COUPLE_POSITION = [1.2, -1.2, 0.2]    // Bottom-right

// Enhanced 3D Stars with Massive Count and Glowing Effects
function SpaceStars() {
  const starsRef = useRef()
  const glowingStarsRef = useRef()
  const distantStarsRef = useRef()

  // Massive regular stars - optimized for mobile
  const { positions, colors, sizes } = useMemo(() => {
    const count = 5000 // Increased star count
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Better spherical distribution
      const radius = 3 + Math.random() * 120
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Natural star colors with more variety
      const starType = Math.random()
      if (starType < 0.6) { // White/blue stars
        const brightness = 0.8 + Math.random() * 0.2
        colors[i3] = brightness
        colors[i3 + 1] = brightness * 0.95
        colors[i3 + 2] = 1.0
      } else if (starType < 0.8) { // Yellow stars
        colors[i3] = 1.0
        colors[i3 + 1] = 0.9 + Math.random() * 0.1
        colors[i3 + 2] = 0.7 + Math.random() * 0.2
      } else if (starType < 0.9) { // Orange stars
        colors[i3] = 1.0
        colors[i3 + 1] = 0.7 + Math.random() * 0.2
        colors[i3 + 2] = 0.4 + Math.random() * 0.2
      } else { // Red stars
        colors[i3] = 1.0
        colors[i3 + 1] = 0.6 + Math.random() * 0.2
        colors[i3 + 2] = 0.6 + Math.random() * 0.2
      }
      
      sizes[i] = 0.015 + Math.random() * 0.06
    }
    
    return { positions, colors, sizes }
  }, [])

  // Glowing stars - more of them with enhanced effects
  const { positions: glowPositions, colors: glowColors, sizes: glowSizes } = useMemo(() => {
    const count = 400 // Increased glowing stars
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      const radius = 8 + Math.random() * 80
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Bright glowing colors with more intensity
      const glowType = Math.random()
      if (glowType < 0.4) {
        // Blue glow - more intense
        colors[i3] = 0.3; colors[i3 + 1] = 0.7; colors[i3 + 2] = 1.0
      } else if (glowType < 0.65) {
        // Gold glow
        colors[i3] = 1.0; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.3
      } else if (glowType < 0.8) {
        // Purple glow
        colors[i3] = 0.8; colors[i3 + 1] = 0.4; colors[i3 + 2] = 1.0
      } else {
        // Pink glow
        colors[i3] = 1.0; colors[i3 + 1] = 0.5; colors[i3 + 2] = 0.8
      }
      
      sizes[i] = 0.08 + Math.random() * 0.15
    }
    
    return { positions, colors, sizes }
  }, [])

  // Distant background stars - very faint
  const { positions: distantPositions, colors: distantColors, sizes: distantSizes } = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      const radius = 100 + Math.random() * 150
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Very faint white
      const brightness = 0.3 + Math.random() * 0.3
      colors[i3] = brightness
      colors[i3 + 1] = brightness
      colors[i3 + 2] = brightness
      
      sizes[i] = 0.01 + Math.random() * 0.03
    }
    
    return { positions, colors, sizes }
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (starsRef.current) {
      starsRef.current.rotation.y = time * 0.015
    }
    if (glowingStarsRef.current) {
      glowingStarsRef.current.rotation.y = time * 0.008
      // Individual pulsing for glowing stars
      const pulse = Math.sin(time * 1.5) * 0.4 + 0.8
      glowingStarsRef.current.material.size = 0.12 * pulse
      glowingStarsRef.current.material.opacity = 0.7 + Math.sin(time * 2) * 0.2
    }
    if (distantStarsRef.current) {
      distantStarsRef.current.rotation.y = time * 0.005
    }
  })

  return (
    <>
      {/* Regular Stars */}
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
          <bufferAttribute
            attach="attributes-size"
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Glowing Stars */}
      <points ref={glowingStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={glowPositions.length / 3}
            array={glowPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={glowColors.length / 3}
            array={glowColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={glowSizes.length}
            array={glowSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Distant Background Stars */}
      <points ref={distantStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={distantPositions.length / 3}
            array={distantPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={distantColors.length / 3}
            array={distantColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={distantSizes.length}
            array={distantSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  )
}

// Magical Nebula with Enhanced Effects
function MagicalNebula() {
  const nebulaRef = useRef()
  const nebulaGlowRef = useRef()
  
  const { positions, colors } = useMemo(() => {
    const count = 1000 // More particles for richer nebula
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Create larger cloud formations
      const radius = 25 + Math.random() * 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      // More dramatic cloud offsets
      const cloudOffset = (Math.random() - 0.5) * 25
      const verticalOffset = (Math.random() - 0.5) * 15
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta) + cloudOffset
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + verticalOffset
      positions[i3 + 2] = radius * Math.cos(phi) + cloudOffset
      
      // Richer nebula colors
      const colorChoice = Math.random()
      if (colorChoice < 0.3) {
        // Deep purple
        colors[i3] = 0.4; colors[i3 + 1] = 0.2; colors[i3 + 2] = 0.7
      } else if (colorChoice < 0.6) {
        // Cosmic blue
        colors[i3] = 0.2; colors[i3 + 1] = 0.4; colors[i3 + 2] = 0.9
      } else if (colorChoice < 0.8) {
        // Magenta
        colors[i3] = 0.7; colors[i3 + 1] = 0.2; colors[i3 + 2] = 0.6
      } else {
        // Teal
        colors[i3] = 0.2; colors[i3 + 1] = 0.6; colors[i3 + 2] = 0.7
      }
    }
    
    return { positions, colors }
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = time * 0.003
      nebulaRef.current.rotation.x = Math.sin(time * 0.002) * 0.08
    }
    if (nebulaGlowRef.current) {
      nebulaGlowRef.current.rotation.y = time * 0.002
      const pulse = Math.sin(time * 0.5) * 0.1 + 0.9
      nebulaGlowRef.current.material.opacity = 0.08 * pulse
    }
  })

  return (
    <>
      <points ref={nebulaRef}>
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
          size={0.5}
          vertexColors
          transparent
          opacity={0.2}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Nebula Glow Layer */}
      <points ref={nebulaGlowRef}>
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
          size={0.8}
          vertexColors
          transparent
          opacity={0.08}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  )
}

// Wedding Marker
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
      onPointerOver={() => setIsHovered(true)} 
      onPointerOut={() => setIsHovered(false)}
    >
      <mesh ref={pulseRef} position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 32]} />
        <meshBasicMaterial 
          color={isActive ? "#00FFFF" : "#FFD700"}
          transparent 
          opacity={0.4} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

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

// Hotel Image Display - Optimized for Mobile
function HotelImageDisplay({ imageUrl, isVisible, imageIndex }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const [texture, setTexture] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!isVisible || !imageUrl) return

    const loader = new THREE.TextureLoader()
    let isMounted = true

    loader.load(
      imageUrl,
      (loadedTexture) => {
        if (isMounted) {
          setTexture(loadedTexture)
          setLoadError(false)
        }
      },
      undefined,
      () => {
        if (isMounted) {
          setLoadError(true)
          setTexture(null)
        }
      }
    )

    return () => {
      isMounted = false
      if (texture) texture.dispose()
    }
  }, [imageUrl, isVisible])

  useFrame((state) => {
    if (groupRef.current && isVisible) {
      groupRef.current.position.y = HOTEL_POSITION[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.02
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.03
    }
  })

  if (!isVisible) return null

  const frameWidth = 2.0 // Smaller for mobile
  const frameHeight = 1.4
  const frameThickness = 0.1

  return (
    <group ref={groupRef} position={HOTEL_POSITION}>
      {/* Thick Frame */}
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

      {/* Image */}
      <mesh ref={meshRef} position={[0, 0, frameThickness/2 + 0.01]}>
        <planeGeometry args={[frameWidth - 0.2, frameHeight - 0.2]} />
        <meshBasicMaterial 
          map={texture}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          color={loadError ? FALLBACK_COLORS[imageIndex % FALLBACK_COLORS.length] : '#ffffff'}
        />
      </mesh>
      
      {/* Glow */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, frameThickness/2 + 0.02]}>
        <ringGeometry args={[frameWidth/2 - 0.05, frameWidth/2, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <Sparkles 
        count={12}
        scale={[frameWidth + 0.3, frameHeight + 0.3, 1]}
        size={0.05}
        speed={0.15}
        opacity={0.8}
        color="#00ffff"
      />
    </group>
  )
}

// Couple Image Display - Optimized for Mobile
function CoupleImageDisplay({ imageUrl, isVisible, imageIndex }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const [texture, setTexture] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!isVisible || !imageUrl) return

    const loader = new THREE.TextureLoader()
    let isMounted = true

    loader.load(
      imageUrl,
      (loadedTexture) => {
        if (isMounted) {
          setTexture(loadedTexture)
          setLoadError(false)
        }
      },
      undefined,
      () => {
        if (isMounted) {
          setLoadError(true)
          setTexture(null)
        }
      }
    )

    return () => {
      isMounted = false
      if (texture) texture.dispose()
    }
  }, [imageUrl, isVisible])

  useFrame((state) => {
    if (groupRef.current && isVisible) {
      groupRef.current.position.y = COUPLE_POSITION[1] + Math.sin(state.clock.elapsedTime * 0.4 + 2) * 0.02
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + 1) * 0.03
    }
  })

  if (!isVisible) return null

  const frameWidth = 1.8 // Smaller for mobile
  const frameHeight = 1.3
  const frameThickness = 0.1

  return (
    <group ref={groupRef} position={COUPLE_POSITION}>
      {/* Thick Frame */}
      <mesh position={[0, 0, -frameThickness/2]}>
        <boxGeometry args={[frameWidth, frameHeight, frameThickness]} />
        <meshStandardMaterial
          color="#ff6b6b"
          metalness={0.8}
          roughness={0.2}
          emissive="#ff6b6b"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Image */}
      <mesh ref={meshRef} position={[0, 0, frameThickness/2 + 0.01]}>
        <planeGeometry args={[frameWidth - 0.15, frameHeight - 0.15]} />
        <meshBasicMaterial 
          map={texture}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          color={loadError ? FALLBACK_COLORS[imageIndex % FALLBACK_COLORS.length] : '#ffffff'}
        />
      </mesh>
      
      {/* Glow */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, frameThickness/2 + 0.02]}>
        <ringGeometry args={[frameWidth/2 - 0.03, frameWidth/2, 32]} />
        <meshBasicMaterial
          color="#ff69b4"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <Sparkles 
        count={15}
        scale={[frameWidth + 0.4, frameHeight + 0.4, 1]}
        size={0.06}
        speed={0.2}
        opacity={0.9}
        color="#ff69b4"
      />
    </group>
  )
}

// Iraq Map
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
      <Line
        points={iraqBorder}
        color="#00FFFF" 
        lineWidth={2}
        transparent
        opacity={0.9}
      />
      
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

      <Line points={TIGRIS_RIVER_COORDINATES} color="#38BDF8" lineWidth={3} transparent opacity={0.7} />
      <Line points={EUPHRATES_RIVER_COORDINATES} color="#1D4ED8" lineWidth={3} transparent opacity={0.7} />

      <WeddingMarker 
        position={BASRA_WEDDING_LOCATION} 
        onClick={onMarkerClick}
        isActive={showVenue}
      />
    </group>
  )
}

// Wedding Information - Mobile Optimized
function WeddingInfoDisplay({ visible }) {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.position.y = -2.8 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={[0, -2.8, 0.1]} visible={visible}>
      <mesh position={[0, -0.12, -0.01]}>
        <planeGeometry args={[1.6, 0.6]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <Text
        fontSize={0.08}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        خالد ❤️ بيار
      </Text>
      <Text
        position={[0, -0.16, 0]}
        fontSize={0.045}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {WEDDING_INFO.date}
      </Text>
      <Text
        position={[0, -0.26, 0]}
        fontSize={0.035}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
        textAlign="center"
      >
        {WEDDING_INFO.location}
      </Text>
    </group>
  )
}

// Camera Controller
function CameraController({ isVenueView, onTransitionComplete }) {
  const { camera } = useThree()
  const progress = useRef(0)
  const isAnimating = useRef(false)
  const prevIsVenueView = useRef(isVenueView)

  useEffect(() => {
    if (isVenueView !== prevIsVenueView.current) {
      isAnimating.current = true
      progress.current = 0
      prevIsVenueView.current = isVenueView
    }
  }, [isVenueView])

  useFrame((state, delta) => {
    if (!isAnimating.current) return

    const targetView = isVenueView ? VENUE_VIEW_BOTH : MAP_VIEW
    const currentView = isVenueView ? MAP_VIEW : VENUE_VIEW_BOTH

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

// Custom Orbit Controls optimized for mobile
function CustomOrbitControls({ isVenueView, isTransitioning }) {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    const controls = controlsRef.current
    if (controls) {
      if (isVenueView) {
        controls.minDistance = 7
        controls.maxDistance = 25
        controls.maxPolarAngle = Math.PI
        controls.enablePan = true
        controls.enableDamping = true
        controls.dampingFactor = 0.05
      } else {
        controls.minDistance = 3
        controls.maxDistance = 12
        controls.maxPolarAngle = Math.PI
        controls.enablePan = true
        controls.enableDamping = true
        controls.dampingFactor = 0.05
      }
    }
  }, [isVenueView])

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enabled={!isTransitioning}
      autoRotate={!isVenueView && !isTransitioning}
      autoRotateSpeed={1}
      rotateSpeed={0.5} // Slower for better mobile control
      zoomSpeed={0.7}
      panSpeed={0.5}
    />
  )
}

// Compact Single Row Navigation - Mobile Optimized
function CompactNavigation({ 
  currentHotelIndex, 
  currentCoupleIndex, 
  totalHotels, 
  totalCouples, 
  onNextHotel, 
  onPrevHotel, 
  onNextCouple, 
  onPrevCouple, 
  onToggleView, 
  showVenue 
}) {
  if (!showVenue) return null

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-[400px]">
      <div className="bg-black/95 backdrop-blur-xl rounded-2xl p-3 border border-cyan-500/60 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          {/* Hotel Controls */}
          <div className="flex items-center gap-1">
            <button 
              className="w-7 h-7 bg-cyan-600/70 hover:bg-cyan-600/90 border border-cyan-400/70 rounded-lg text-cyan-100 text-xs transition-all duration-200 hover:scale-110 flex items-center justify-center"
              onClick={onPrevHotel}
            >
              ◀
            </button>
            <div className="text-yellow-200 text-xs font-semibold min-w-[35px] text-center">
              🏨 {currentHotelIndex + 1}/{totalHotels}
            </div>
            <button 
              className="w-7 h-7 bg-cyan-600/70 hover:bg-cyan-600/90 border border-cyan-400/70 rounded-lg text-cyan-100 text-xs transition-all duration-200 hover:scale-110 flex items-center justify-center"
              onClick={onNextHotel}
            >
              ▶
            </button>
          </div>

          {/* Map Button */}
          <button 
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 border border-purple-400/70 rounded-lg text-white text-xs font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1"
            onClick={() => onToggleView('map')}
          >
            <span>🌍</span>
            <span>الخريطة</span>
          </button>

          {/* Couple Controls */}
          <div className="flex items-center gap-1">
            <button 
              className="w-7 h-7 bg-pink-600/70 hover:bg-pink-600/90 border border-pink-400/70 rounded-lg text-pink-100 text-xs transition-all duration-200 hover:scale-110 flex items-center justify-center"
              onClick={onPrevCouple}
            >
              ◀
            </button>
            <div className="text-yellow-200 text-xs font-semibold min-w-[35px] text-center">
              💑 {currentCoupleIndex + 1}/{totalCouples}
            </div>
            <button 
              className="w-7 h-7 bg-pink-600/70 hover:bg-pink-600/90 border border-pink-400/70 rounded-lg text-pink-100 text-xs transition-all duration-200 hover:scale-110 flex items-center justify-center"
              onClick={onNextCouple}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IraqWeddingMap() {
  const [mounted, setMounted] = useState(false)
  const [showVenue, setShowVenue] = useState(false)
  const [currentHotelIndex, setCurrentHotelIndex] = useState(0)
  const [currentCoupleIndex, setCurrentCoupleIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [interactionLock, setInteractionLock] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Different timing for each frame - Hotel changes every 12 seconds, Couple every 18 seconds
  useEffect(() => {
    if (!showVenue || isTransitioning || interactionLock) return

    const hotelInterval = setInterval(() => {
      setCurrentHotelIndex(prev => (prev + 1) % HOTEL_IMAGES.length)
    }, 12000) // 12 seconds

    const coupleInterval = setInterval(() => {
      setCurrentCoupleIndex(prev => (prev + 1) % COUPLE_PHOTOS.length)
    }, 18000) // 18 seconds

    return () => {
      clearInterval(hotelInterval)
      clearInterval(coupleInterval)
    }
  }, [showVenue, isTransitioning, interactionLock])

  const handleMarkerClick = useMemo(() => (e) => {
    if (interactionLock || showVenue) return
    e.stopPropagation() 
    setIsTransitioning(true)
    setShowVenue(true)
    setInteractionLock(true)
    setTimeout(() => setInteractionLock(false), 2000)
  }, [interactionLock, showVenue])

  const handleNextHotel = useMemo(() => () => {
    if (interactionLock) return
    setInteractionLock(true)
    setCurrentHotelIndex(prev => (prev + 1) % HOTEL_IMAGES.length)
    setTimeout(() => setInteractionLock(false), 500)
  }, [interactionLock])

  const handlePrevHotel = useMemo(() => () => {
    if (interactionLock) return
    setInteractionLock(true)
    setCurrentHotelIndex(prev => (prev - 1 + HOTEL_IMAGES.length) % HOTEL_IMAGES.length)
    setTimeout(() => setInteractionLock(false), 500)
  }, [interactionLock])

  const handleNextCouple = useMemo(() => () => {
    if (interactionLock) return
    setInteractionLock(true)
    setCurrentCoupleIndex(prev => (prev + 1) % COUPLE_PHOTOS.length)
    setTimeout(() => setInteractionLock(false), 500)
  }, [interactionLock])

  const handlePrevCouple = useMemo(() => () => {
    if (interactionLock) return
    setInteractionLock(true)
    setCurrentCoupleIndex(prev => (prev - 1 + COUPLE_PHOTOS.length) % COUPLE_PHOTOS.length)
    setTimeout(() => setInteractionLock(false), 500)
  }, [interactionLock])

  const handleToggleView = useMemo(() => (viewType) => {
    if (interactionLock) return
    
    setInteractionLock(true)
    
    if (viewType === 'map') {
      setIsTransitioning(true)
      setShowVenue(false)
    }
    
    setTimeout(() => {
      setIsTransitioning(false)
      setInteractionLock(false)
    }, 1500)
  }, [interactionLock])

  const handleTransitionComplete = useMemo(() => () => {
    setIsTransitioning(false)
  }, [])

  const currentHotelUrl = HOTEL_IMAGES[currentHotelIndex]
  const currentCoupleUrl = COUPLE_PHOTOS[currentCoupleIndex]

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg animate-pulse text-center px-4">
          جاري تحميل رحلة زفاف خالد ❤️ بيار...
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden touch-none">
      <Canvas 
        camera={{ 
          position: MAP_VIEW.position,
          fov: 50, // Better for mobile
          near: 0.1,
          far: 1000
        }}
        gl={{ antialias: true }}
        dpr={[1, 2]} // Better performance on mobile
      >
        <color attach="background" args={['#000011']} />
        
        {/* Enhanced Space Environment */}
        <SpaceStars />
        <MagicalNebula />
        
        <fog attach="fog" args={['#000011', 10, 200]} />
        
        {/* Iraq Map */}
        <IraqiMap onMarkerClick={handleMarkerClick} showVenue={showVenue} />
        
        {/* Image Frames - Diagonal Layout */}
        <HotelImageDisplay 
          imageUrl={currentHotelUrl}
          isVisible={showVenue}
          imageIndex={currentHotelIndex}
        />
        
        <CoupleImageDisplay 
          imageUrl={currentCoupleUrl}
          isVisible={showVenue}
          imageIndex={currentCoupleIndex}
        />
        
        {/* Wedding Information */}
        <WeddingInfoDisplay visible={showVenue} />
        
        {/* Camera Controller */}
        <CameraController 
          isVenueView={showVenue} 
          onTransitionComplete={handleTransitionComplete}
        />
        
        {/* Orbit Controls */}
        <CustomOrbitControls 
          isVenueView={showVenue}
          isTransitioning={isTransitioning}
        />
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 5, 5]} intensity={0.6} color="#3b82f6" />
        <pointLight position={[0, -5, 5]} intensity={0.4} color="#ef4444" />
        
        <spotLight 
          position={[HOTEL_POSITION[0], HOTEL_POSITION[1], 8]} 
          intensity={showVenue ? 1 : 0.2} 
          color="#00ffff"
          angle={0.3}
          penumbra={0.5}
          distance={15}
        />
        
        <spotLight 
          position={[COUPLE_POSITION[0], COUPLE_POSITION[1], 8]} 
          intensity={showVenue ? 1 : 0.2} 
          color="#ff69b4"
          angle={0.3}
          penumbra={0.5}
          distance={15}
        />

        {/* Magical Ambient Glow */}
        <mesh position={[0, 0, -5]}>
          <sphereGeometry args={[8, 32, 32]} />
          <meshBasicMaterial
            color="#001122"
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
      </Canvas>

      {/* Title - Mobile Optimized */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-center w-[90%]">
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-200 to-purple-300 mb-1">
          خالد ❤️ بيار
        </h1>
        <p className="text-white/80 text-[11px] mb-1">{WEDDING_INFO.date}</p>
        <p className="text-white/60 text-[10px] leading-tight">{WEDDING_INFO.location}</p>
      </div>

      {/* Compact Single Row Navigation */}
      <CompactNavigation 
        currentHotelIndex={currentHotelIndex}
        currentCoupleIndex={currentCoupleIndex}
        totalHotels={HOTEL_IMAGES.length}
        totalCouples={COUPLE_PHOTOS.length}
        onNextHotel={handleNextHotel}
        onPrevHotel={handlePrevHotel}
        onNextCouple={handleNextCouple}
        onPrevCouple={handlePrevCouple}
        onToggleView={handleToggleView}
        showVenue={showVenue}
      />

      {/* Loading Transition */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-base animate-pulse text-center">
            {showVenue ? '✨ جاري التكبير...' : '🌍 العودة إلى الخريطة...'}
          </div>
        </div>
      )}

      {/* Mobile Touch Instructions */}
      {!showVenue && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-white/60 text-xs animate-pulse">
            💫 اضغط على المؤشر الذهبي لعرض الصور
          </p>
        </div>
      )}
    </div>
  )
}