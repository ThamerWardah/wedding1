'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaHeart, FaPause, FaPlay } from 'react-icons/fa'
import RSVPModal from '../components/RSVPModal'

export default function WeddingCelebrationArabic() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentBg, setCurrentBg] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [weddingSettings, setWeddingSettings] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showMusicHint, setShowMusicHint] = useState(true)
  const audioRef = useRef(null)

  // Romantic Arabic wedding music playlist
  const songs = useMemo(() => ['/music/song1.mp3'], [])

  const [currentSongIndex, setCurrentSongIndex] = useState(0)

  // High-quality background images with better resolution
  const backgrounds = useMemo(() => ['/w3.jpg', '/w4.jpg', '/w2.jpg'], [])

  // Section background images
  const sectionBackgrounds = useMemo(
    () => ({
      header: '/h1.jpg',
      couple: '/h2.jpg',
      date: '/h3.jpg',
      venue: '/h4.jpg',
      quote: '/h5.jpg',
    }),
    [],
  )

  // Beautiful color palette
  const colors = useMemo(
    () => ({
      primary: '#8B5CF6', // Purple
      secondary: '#EC4899', // Pink
      accent: '#F59E0B', // Amber
      gold: '#FBBF24', // Light Gold
      rose: '#FB7185', // Rose
      emerald: '#10B981', // Emerald
    }),
    [],
  )

  // Fetch wedding settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const settings = await response.json()
          setWeddingSettings(settings)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    fetchSettings()
  }, [])

  // Preload all assets
  useEffect(() => {
    const preloadAssets = async () => {
      const allImages = [...backgrounds, ...Object.values(sectionBackgrounds)]

      const imagePromises = allImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.src = src
          img.onload = resolve
          img.onerror = () => {
            console.warn(`Failed to load image: ${src}`)
            resolve() // Continue even if some images fail
          }
        })
      })

      // Preload music file
      const audioPromise = new Promise((resolve) => {
        if (songs[0]) {
          const audio = new Audio()
          audio.src = songs[0]
          audio.oncanplaythrough = resolve
          audio.onerror = resolve
        } else {
          resolve()
        }
      })

      try {
        await Promise.all([...imagePromises, audioPromise])
        setIsLoaded(true)
      } catch (error) {
        console.error('Error preloading assets:', error)
        setIsLoaded(true)
      }
    }

    preloadAssets()
  }, [backgrounds, sectionBackgrounds, songs])

  // Smooth background rotation
  useEffect(() => {
    if (!isLoaded) return

    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length)
    }, 10000) // Change every 10 seconds for smoother transitions

    return () => clearInterval(interval)
  }, [backgrounds.length, isLoaded])

  // Auto-open modal after 20 seconds
  useEffect(() => {
    if (!isLoaded) return

    const timer = setTimeout(() => setIsModalOpen(true), 20000)
    return () => clearTimeout(timer)
  }, [isLoaded])

  // Handle user interaction for music
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true)
      setShowMusicHint(false)
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.log('Audio play failed:', error)
          })
      }
    }
  }

  // Music control functions
  const toggleMusic = () => {
    if (!userInteracted) {
      setUserInteracted(true)
      setShowMusicHint(false)
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch((error) => {
          console.log('Audio play failed:', error)
        })
        setIsPlaying(true)
      }
    }
  }

  const handleNextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length)
    if (isPlaying) {
      setTimeout(() => {
        audioRef.current?.play()
      }, 100)
    }
  }

  const handleSongEnd = () => {
    handleNextSong()
  }

  // Hide music hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMusicHint(false)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  // Enhanced floating animation
  const FloatingElement = useCallback(
    ({ children, delay, duration = 8, className = '' }) => (
      <motion.div
        className={`absolute ${className}`}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{
          opacity: [0, 0.8, 0.6, 0],
          y: [20, -80, -160],
          scale: [0.8, 1.1, 0.9],
          rotate: [0, 10, -5, 0],
        }}
        transition={{
          duration: duration,
          delay: delay,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    ),
    [],
  )

  // Enhanced sparkle animation
  const Sparkle = useCallback(
    ({ index }) => (
      <motion.div
        className="absolute text-yellow-200 text-xl z-2"
        style={{
          left: `${10 + ((index * 30) % 80)}%`,
          top: `${15 + ((index * 25) % 65)}%`,
        }}
        animate={{
          opacity: [0, 0.9, 0],
          scale: [0.2, 1.1, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 5 + Math.random() * 4,
          delay: index * 0.3,
          repeat: Infinity,
        }}
      >
        ✨
      </motion.div>
    ),
    [],
  )

  // Heart positions with smoother movement
  const heartPositions = useMemo(
    () => [
      { x: 8, y: 12, delay: 0, duration: 12 },
      { x: 88, y: 18, delay: 1.2, duration: 14 },
      { x: 22, y: 75, delay: 2.8, duration: 11 },
      { x: 78, y: 68, delay: 1.8, duration: 13 },
      { x: 52, y: 8, delay: 0.6, duration: 10 },
      { x: 38, y: 58, delay: 3.2, duration: 15 },
      { x: 72, y: 35, delay: 2.2, duration: 9 },
      { x: 28, y: 45, delay: 0.9, duration: 16 },
    ],
    [],
  )

  // Show elegant loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-6xl text-white mb-6"
          >
            💍
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl text-white font-arabic mb-4 font-light"
          >
            جاري تحميل الدعوة...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/70 text-lg font-arabic"
          >
            استعدوا لأجمل ليلة في العمر
          </motion.p>
          <motion.div className="mt-6 w-48 h-1 bg-white/30 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-pink-400"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const weddingDate = weddingSettings
    ? new Date(weddingSettings.weddingDate)
    : new Date('2025-10-12')
  const arabicDate = weddingDate.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center text-center font-arabic bg-black px-4 py-4 select-none"
      onClick={handleUserInteraction}
      onKeyDown={handleUserInteraction}
      role="button"
      tabIndex={0}
    >
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={songs[currentSongIndex]}
        onEnded={handleSongEnd}
        loop={false}
        preload="auto"
      />

      {/* Enhanced Background Images with Better Overlay */}
      <div className="absolute inset-0">
        {backgrounds.map((bg, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 35%',
              filter: 'brightness(0.8) contrast(1.1)',
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentBg === i ? 1 : 0,
              scale: currentBg === i ? 1 : 1.05,
            }}
            transition={{
              duration: 2.5,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        ))}

        {/* Enhanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/25 to-pink-900/25 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40"></div>
      </div>

      {/* Enhanced Animated Elements */}
      {heartPositions.map((pos, i) => (
        <FloatingElement
          key={i}
          delay={pos.delay}
          duration={pos.duration}
        >
          <div style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
            <FaHeart
              className={`
              text-2xl 
              ${
                i % 4 === 0
                  ? 'text-rose-300'
                  : i % 4 === 1
                  ? 'text-pink-300'
                  : i % 4 === 2
                  ? 'text-red-300'
                  : 'text-yellow-300'
              }
              drop-shadow-2xl filter brightness-125
            `}
            />
          </div>
        </FloatingElement>
      ))}

      {[...Array(12)].map((_, i) => (
        <Sparkle
          key={i}
          index={i}
        />
      ))}

      {/* Enhanced Floating Rose Petals */}
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl z-2 pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${-15 - Math.random() * 25}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, window.innerHeight + 200],
            x: [0, (Math.random() - 0.5) * 150],
            rotate: [0, 120, 240, 360],
            scale: [0.8, 1.1, 0.9],
          }}
          transition={{
            duration: 18 + Math.random() * 12,
            delay: Math.random() * 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {i % 3 === 0 ? '🌹' : i % 3 === 1 ? '💫' : '✨'}
        </motion.div>
      ))}

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-4xl mx-auto space-y-8 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/25 shadow-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        }}
      >
        {/* Enhanced Header Section with Background */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="relative rounded-2xl p-8 mb-8 overflow-hidden"
          style={{
            backgroundImage: `url(${sectionBackgrounds.header})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>

          <div className="relative z-10">
            <motion.div
              animate={{
                rotate: [0, 3, -3, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="text-5xl mb-6"
            >
              💫
            </motion.div>

            <motion.h1
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, type: 'spring', stiffness: 100 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent font-elegant leading-tight"
            >
              ليلة من العمر
            </motion.h1>

            <motion.div
              className="h-1.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full w-56 mx-auto my-6"
              initial={{ width: 0 }}
              animate={{ width: 224 }}
              transition={{ delay: 1, duration: 1.2 }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-white/90 text-xl font-light tracking-wide"
            >
              بداية قصة حب لا تنتهي
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced Couple Section with Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="relative rounded-2xl p-8 mb-8 overflow-hidden"
          style={{
            backgroundImage: `url(${sectionBackgrounds.couple})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-purple-900/50 rounded-2xl"></div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-3xl md:text-4xl text-white font-semibold mb-8 text-center"
            >
              <span className="block text-yellow-200 mb-4 text-4xl drop-shadow-lg">
                {weddingSettings?.coupleNames?.groom || 'العريس'}
              </span>

              <motion.div
                className="text-5xl my-6"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                💞
              </motion.div>

              <span className="block text-pink-200 mt-4 text-4xl drop-shadow-lg">
                {weddingSettings?.coupleNames?.bride || 'العروس'}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-white/90 text-xl leading-relaxed text-center italic font-light tracking-wide"
            >
              "بالحب جمعنا الله، وبالعمر جمعنا القدر، وبالقلب كتبنا أجمل القصص"
              <span className="block text-3xl mt-4">💍</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced Date & Location Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="grid md:grid-cols-2 gap-8 mb-8"
        >
          {/* Date Section */}
          <motion.div
            className="relative rounded-2xl p-8 overflow-hidden"
            style={{
              backgroundImage: `url(${sectionBackgrounds.date})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-orange-900/50 rounded-2xl"></div>
            <div className="relative z-10">
              <motion.div
                className="text-4xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                📅
              </motion.div>
              <div className="text-2xl md:text-3xl font-semibold text-yellow-200 mb-3 drop-shadow-lg">
                {arabicDate}
              </div>
              <div className="text-white/90 text-lg font-light">
                الساعة ٧:٠٠ مساءً
              </div>
            </div>
          </motion.div>

          {/* Venue Section */}
          <motion.div
            className="relative rounded-2xl p-8 overflow-hidden"
            style={{
              backgroundImage: `url(${sectionBackgrounds.venue})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-purple-900/50 rounded-2xl"></div>
            <div className="relative z-10">
              <motion.div
                className="text-4xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                🏰
              </motion.div>
              <div className="text-xl md:text-2xl font-semibold text-purple-200 mb-3 drop-shadow-lg">
                {weddingSettings?.venue || 'البصرة - قاعة ألف ليلة وليلة'}
              </div>
              <div className="text-white/80 text-base font-light">
                قاعة الاحتفالات الملكية
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Central Heart Animation */}
        <motion.div
          className="my-12 flex justify-center"
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 text-7xl text-yellow-300/40"
            >
              ✨
            </motion.div>
            <FaHeart className="text-8xl text-rose-400 drop-shadow-2xl relative z-10 filter brightness-110" />
          </div>
        </motion.div>

        {/* Enhanced Romantic Quote Section with Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{
            backgroundImage: `url(${sectionBackgrounds.quote})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-pink-900/40 rounded-2xl"></div>

          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="text-white/95 text-xl leading-loose text-center font-light italic tracking-wide drop-shadow-lg"
            >
              "في هذه الليلة المباركة، حيث تلتقي القلوب وتتحد الأرواح، نحتفل
              ببداية رحلة حب جديدة... رحلة تبدأ بوعود وتستمر بذكريات جميلة
              ترويها الأيام، وتنتهي بخلود في جنات النعيم"
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-4xl mt-6 text-yellow-200 text-center"
            >
              🌙
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Music Control Button */}
      <motion.button
        onClick={toggleMusic}
        className="fixed bottom-8 left-8 z-50 bg-gradient-to-br from-purple-600 to-pink-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/30 hover:scale-110 transition-all duration-300 group backdrop-blur-sm"
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, type: 'spring' }}
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: isPlaying ? 360 : 0,
              scale: isPlaying ? 1.3 : 1,
            }}
            transition={{
              duration: isPlaying ? 2 : 0.4,
              repeat: isPlaying ? Infinity : 0,
              ease: 'linear',
            }}
            className="text-xl"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </motion.div>
          <span className="text-sm font-arabic hidden group-hover:block transition-all duration-300 bg-white/20 px-2 py-1 rounded-lg">
            {isPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
          </span>
        </div>
      </motion.button>

      {/* Enhanced Music Hint */}
      <AnimatePresence>
        {showMusicHint && !userInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-32 z-50 bg-black/90 backdrop-blur-lg text-white p-4 rounded-2xl border border-white/20 max-w-xs shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                🎵
              </motion.div>
              <div>
                <p className="text-sm font-arabic font-semibold text-white">
                  انقر في أي مكان
                </p>
                <p className="text-xs text-white/70 font-arabic">
                  لبدء موسيقى الحفل الرومانسية
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced RSVP Button */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-rose-500 to-yellow-400 text-white px-10 py-5 rounded-2xl shadow-2xl border-2 border-yellow-300 font-semibold text-lg hover:shadow-3xl transition-all duration-300 group backdrop-blur-sm"
        whileHover={{
          scale: 1.05,
          y: -2,
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8, type: 'spring' }}
        style={{
          background: 'linear-gradient(135deg, #F43F5E 0%, #F59E0B 100%)',
        }}
      >
        <div className="flex items-center gap-4">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl"
          >
            💌
          </motion.span>
          <span className="text-lg">تأكيد الحضور</span>
          <motion.span
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl"
          >
            →
          </motion.span>
        </div>
      </motion.button>

      {/* Enhanced Elegant Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="mt-12 mb-32 text-white/80 text-base z-10 text-center"
      >
        <p className="font-light mb-4 tracking-wide">
          بكل الحب والفرح، ندعوكم لمشاركتنا هذه اللحظات الخاصة في رحلتنا
        </p>
        <div className="flex justify-center gap-6 text-2xl">
          {['💐', '🌹', '✨', '🌟', '💫'].map((icon, index) => (
            <motion.span
              key={icon}
              animate={{
                scale: [1, 1.3, 1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.6,
              }}
            >
              {icon}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* RSVP Modal */}
      <RSVPModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guestNumber={null}
        guestName="ضيفنا الكريم"
      />

      {/* Enhanced Floating Music Notes when playing */}
      <AnimatePresence>
        {isPlaying && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="fixed text-3xl z-40 pointer-events-none"
                style={{
                  left: `${5 + i * 12}%`,
                  bottom: '3%',
                }}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.9, 0],
                  y: [0, -200, -400],
                  x: [
                    0,
                    (Math.random() - 0.5) * 120,
                    (Math.random() - 0.5) * 240,
                  ],
                  rotate: [0, 180, 360],
                  scale: [0, 1.2, 0.8],
                }}
                transition={{
                  duration: 6 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {['🎵', '🎶', '🎼', '🎹'][i % 4]}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
