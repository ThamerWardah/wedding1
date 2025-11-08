
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaClock, FaHeart, FaMapMarkerAlt, FaPause, FaPlay } from 'react-icons/fa'
import RSVPModal from '../../components/RSVPModal'

export default function WeddingCelebrationArabic() {
  const params = useParams()
  const guestNumber = params?.guestNumber
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentBg, setCurrentBg] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [weddingSettings, setWeddingSettings] = useState(null)
  const [guestInfo, setGuestInfo] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showMusicHint, setShowMusicHint] = useState(true)
  const [lang, setLang] = useState('ar')
  const [timeLeft, setTimeLeft] = useState({})
  const [audioReady, setAudioReady] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const audioRef = useRef(null)

  // Wedding date
  const WEDDING_DATE = new Date('2025-12-19T19:00:00')

  // Detect iOS on component mount
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window ).MSStream
    setIsIOS(iOS)
    console.log('iOS detected:', iOS)
  }, [])

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const diff = WEDDING_DATE - now

      if (diff <= 0) {
        clearInterval(timer)
        setTimeLeft({ finished: true })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Romantic Arabic wedding music playlist
  const songs = useMemo(() => ['/music/song1.mp3'], [])

  const [currentSongIndex, setCurrentSongIndex] = useState(0)

  // High-quality background images with better resolution
  const backgrounds = useMemo(() => ['/h1.jpg'], [])

  // Section background images
  const sectionBackgrounds = useMemo(
    () => ({
      header: '/h2.jpg',
      couple: '/h3.jpg',
      date: '/h2.jpg',
      venue: '/h1.jpg',
      quote: '/h1.jpg',
    }),
    [],
  )

  // Translation texts
  const t = useMemo(() => ({
    ar: {
      title: 'افراح الظاهر والعتيبي',
      welcome: 'مرحباً بك',
      guestName: 'ضيفنا الكريم',
      couple: 'خالد ❤️ بيار',
      groom: 'خالد',
      bride: 'بيار',
      message: 'في هذه الليلة يكتمل الحُلم وتُتَوَّج اسطورة حُبنا, فكونوا معنا شهودًا على فرحتنا',
      date: 'الجمعة 19 ديسمبر 2025',
      time: 'الساعة السابعة مساءً',
      location: 'البصرة - قاعة فندق جراند ملينيوم السيف',
      countdown: 'العد التنازلي ليوم الزفاف',
      finished: 'اليوم المنتظر قد حلّ 🎉',
      rsvp: 'تأكيد الحضور',
      switch: 'English',
      days: 'يوم',
      hours: 'ساعة',
      minutes: 'دقيقة',
      seconds: 'ثانية',
      quote: 'من لُجَّ الكويت لشواطئ البصرة دانة الدُنا بين أيادي المَعشوق',
      loading: 'جاري تحميل الدعوة...',
      preparing: 'استعدوا لأجمل ليلة في العمر',
      clickAnywhere: 'انقر في أي مكان',
      startMusic: 'لبدء موسيقى الحفل الرومانسية',
      playMusic: 'تشغيل الموسيقى',
      pauseMusic: 'إيقاف الموسيقى',
      royalHall: 'قاعة الاحتفالات الملكية',
      finalMessage: 'بكل الحب والفرح، ندعوكم لمشاركتنا هذه اللحظات الخاصة في رحلتنا'
    },
    en: {
      title: 'Al Zaher & Al Otaibi Wedding',
      welcome: 'Welcome',
      guestName: 'Our Honored Guest',
      couple: 'Khaled ❤️ Bayan',
      groom: 'Khaled',
      bride: 'Bayan',
      message: 'In this blessed night, our dream comes true and our love story is crowned. Join us as witnesses to our joy.',
      date: 'Friday, December 19, 2025',
      time: '7:00 PM',
      location: 'Basra - Grand Millennium Al Seef Hotel',
      countdown: 'Countdown to the Wedding',
      finished: 'The big day has arrived 🎉',
      rsvp: 'RSVP',
      switch: 'العربية',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      quote: 'From the depths of Kuwait to the shores of Basra, our precious pearl in the hands of the beloved',
      loading: 'Loading Invitation...',
      preparing: 'Get ready for the most beautiful night of your life',
      clickAnywhere: 'Click anywhere',
      startMusic: 'To start romantic wedding music',
      playMusic: 'Play Music',
      pauseMusic: 'Pause Music',
      royalHall: 'Royal Celebration Hall',
      finalMessage: 'With all our love and joy, we invite you to share these special moments in our journey'
    },
  }[lang]), [lang])

  // iOS-specific audio fallback
  const handleIOSAudioFallback = useCallback(() => {
    console.log('Attempting iOS audio fallback...')
    const iosAudio = new Audio(songs[currentSongIndex])
    iosAudio.preload = 'auto'
    iosAudio.volume = 0.7
    iosAudio.playsInline = true
    
    iosAudio.play().then(() => {
      console.log('iOS fallback audio started successfully')
      setIsPlaying(true)
      audioRef.current = iosAudio
    }).catch(error => {
      console.log('iOS fallback also failed:', error)
    })
  }, [songs, currentSongIndex])

  // Enhanced user interaction handler for iOS
  const handleUserInteraction = useCallback((e) => {
    if (e) {
      e.preventDefault()
    }
    
    if (!userInteracted) {
      setUserInteracted(true)
      setShowMusicHint(false)
      
      // iOS-specific audio play
      if (audioRef.current && audioReady) {
        const playPromise = audioRef.current.play()
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started successfully on iOS')
              setIsPlaying(true)
              if (audioRef.current) {
                audioRef.current.volume = 0.7
              }
            })
            .catch((error) => {
              console.log('iOS Audio play failed, trying fallback:', error)
              handleIOSAudioFallback()
            })
        }
      } else if (!audioReady) {
        console.log('Audio not ready yet, will retry...')
        // Audio might not be ready, we'll rely on the toggle button
      }
    }
  }, [userInteracted, audioReady, handleIOSAudioFallback])

  // Touch-specific handler for iOS
  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    handleUserInteraction()
  }, [handleUserInteraction])

  // Enhanced audio initialization
  useEffect(() => {
    const initializeAudio = () => {
      if (audioRef.current) {
        // iOS requires specific settings
        audioRef.current.preload = 'auto'
        audioRef.current.playsInline = true
        audioRef.current.setAttribute('webkit-playsinline', 'true')
        audioRef.current.setAttribute('playsinline', 'true')
        
        // Set volume to 0 initially for iOS
        audioRef.current.volume = 0.5
        
        // Force load on iOS
        audioRef.current.load()
        
        console.log('Audio initialized for iOS:', isIOS)
        
        // Mark audio as ready after a short delay
        setTimeout(() => {
          setAudioReady(true)
        }, 1000)
      }
    }

    if (isLoaded) {
      initializeAudio()
    }
  }, [isLoaded, isIOS])

  // Fetch wedding settings and guest info
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        // Fetch wedding settings
        const settingsResponse = await fetch('/api/settings')
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json()
          setWeddingSettings(settings)
        }

        // Fetch guest info if number is provided
        if (guestNumber) {
          const guestResponse = await fetch(`/api/guests/${guestNumber}`)
          if (guestResponse.ok) {
            const guestData = await guestResponse.json()
            setGuestInfo(guestData)
          } else {
            // Set default guest info if not found
            setGuestInfo({ name: t.guestName, number: guestNumber })
          }
        } else {
          // Set default guest info
          setGuestInfo({ name: t.guestName, number: '000' })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Set defaults on error
        setGuestInfo({ name: t.guestName, number: guestNumber || '000' })
      }
    }

    if (isLoaded) {
      fetchData()
    }
  }, [isLoaded, guestNumber, t.guestName])

  // Enhanced preload function for iOS compatibility
  const preloadAssets = useCallback(async () => {
    const allImages = [...backgrounds, ...Object.values(sectionBackgrounds)]

    const imagePromises = allImages.map((src) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = resolve
        img.onerror = () => {
          console.warn(`Failed to load image: ${src}`)
          resolve()
        }
      })
    })

    // iOS-specific audio preloading
    const audioPromise = new Promise((resolve) => {
      if (songs[0]) {
        const audio = new Audio()
        audio.src = songs[0]
        audio.preload = 'auto'
        audio.playsInline = true
        
        // iOS requires this event
        audio.oncanplaythrough = () => {
          console.log('Audio can play through on iOS')
          resolve(true)
        }
        
        audio.onerror = (e) => {
          console.warn('Audio preload error on iOS:', e)
          resolve(false)
        }
        
        // Force load on iOS
        audio.load()
        
        // Fallback timeout for iOS
        setTimeout(() => resolve(true), 1500)
      } else {
        resolve(true)
      }
    })

    try {
      await Promise.all([...imagePromises, audioPromise])
      console.log('All assets preloaded successfully')
      setIsLoaded(true)
    } catch (error) {
      console.error('Error preloading assets:', error)
      setIsLoaded(true) // Still continue even if some assets fail
    }
  }, [backgrounds, sectionBackgrounds, songs])

  // Preload all assets
  useEffect(() => {
    preloadAssets()
  }, [preloadAssets])

  // Smooth background rotation
  useEffect(() => {
    if (!isLoaded) return

    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length)
    }, 15000)

    return () => clearInterval(interval)
  }, [backgrounds.length, isLoaded])

  // Auto-open modal after 20 seconds
  useEffect(() => {
    if (!isLoaded) return

    const timer = setTimeout(() => setIsModalOpen(true), 20000)
    return () => clearTimeout(timer)
  }, [isLoaded])

  // Enhanced music control functions
  const toggleMusic = useCallback((e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    if (!userInteracted) {
      setUserInteracted(true)
      setShowMusicHint(false)
    }

    if (audioRef.current && audioReady) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        // iOS-specific play handling
        const playPromise = audioRef.current.play()
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((error) => {
              console.log('iOS toggle play failed:', error)
              handleIOSAudioFallback()
            })
        }
      }
    } else if (!audioReady) {
      console.log('Audio not ready, initializing...')
      handleUserInteraction()
    }
  }, [userInteracted, isPlaying, audioReady, handleIOSAudioFallback, handleUserInteraction])

  const handleNextSong = useCallback(() => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length)
    if (isPlaying) {
      setTimeout(() => {
        audioRef.current?.play().catch(error => {
          console.log('Next song play failed:', error)
        })
      }, 100)
    }
  }, [songs.length, isPlaying])

  const handleSongEnd = useCallback(() => {
    handleNextSong()
  }, [handleNextSong])

  // Hide music hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMusicHint(false)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  // Optimized heart animation - pulsing hearts with good performance
  const HeartAnimation = useCallback(() => {
    const heartPositions = useMemo(
      () => [
        { x: 10, y: 15, delay: 0, size: 'text-lg' },
        { x: 85, y: 20, delay: 1, size: 'text-xl' },
        { x: 25, y: 70, delay: 2, size: 'text-sm' },
        { x: 75, y: 65, delay: 3, size: 'text-md' },
        { x: 50, y: 10, delay: 0.5, size: 'text-lg' },
        { x: 15, y: 85, delay: 1.5, size: 'text-sm' },
        { x: 90, y: 75, delay: 2.5, size: 'text-md' },
        { x: 40, y: 40, delay: 0.8, size: 'text-xl' },
      ],
      [],
    )

    return (
      <>
        {heartPositions.map((pos, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos.size} z-2 pointer-events-none`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              delay: pos.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <FaHeart
              className={`
                ${i % 4 === 0 ? 'text-rose-300' : 
                  i % 4 === 1 ? 'text-pink-300' : 
                  i % 4 === 2 ? 'text-yellow-300' : 'text-purple-300'}
                drop-shadow-lg filter brightness-110
              `}
            />
          </motion.div>
        ))}
      </>
    )
  }, [])

  // Show elegant loading state
  if (!isLoaded) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 flex items-center justify-center"
        style={{
          WebkitTransform: 'translate3d(0,0,0)',
          transform: 'translate3d(0,0,0)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
          style={{
            WebkitTransform: 'translate3d(0,0,0)',
            transform: 'translate3d(0,0,0)'
          }}
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
            {t.loading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/70 text-lg font-arabic"
          >
            {t.preparing}
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

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center text-center font-arabic bg-amber-50 px-4 py-4 select-none"
      onClick={handleUserInteraction}
      onTouchStart={handleTouchStart}
      onKeyDown={handleUserInteraction}
      role="button"
      tabIndex={0}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTransform: 'translate3d(0,0,0)',
        transform: 'translate3d(0,0,0)'
      }}
    >
      {/* Hidden Audio Element with iOS optimizations */}
      <audio
        ref={audioRef}
        src={songs[currentSongIndex]}
        onEnded={handleSongEnd}
        loop={false}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onLoadedMetadata={() => {
          setAudioReady(true)
        }}
        onError={(e) => {
          console.error('Audio error:', e)
        }}
      />


      {/* Heart Animation Component */}

      {/* Language Switch Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          setLang(lang === 'ar' ? 'en' : 'ar')
        }}
        className="fixed top-6 left-6 z-50 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-all duration-300 border border-white/30 font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {t.switch}
      </motion.button>

      {/* Main Content Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-4xl mx-auto space-y-6 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            WebkitTransform: 'translate3d(0,0,0)',
            transform: 'translate3d(0,0,0)'
          }}
        >
          {/* Guest Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-4 "
          >
            <motion.h3
              className="text-xl text-white/80 font-light mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {t.welcome}
            </motion.h3>
            <motion.h2
              className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
            >
              {guestInfo?.name || t.guestName}
            </motion.h2>
            {guestInfo?.number && (
              <motion.p
                className="text-white/60 text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                #{guestInfo.number}
              </motion.p>
            )}
          </motion.div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative rounded-2xl p-6 mb-6 overflow-hidden"
          >
            <div className="absolute inset-0  rounded-2xl"
                        style={{
              backgroundImage: `url(${sectionBackgrounds.header})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            ></div>
            <div className="relative z-10">
              <motion.h1
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent font-elegant"
              >
                {t.title}
              </motion.h1>
              <motion.div
                className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full w-48 mx-auto my-4"
                initial={{ width: 0 }}
                animate={{ width: 192 }}
                transition={{ delay: 0.8, duration: 1 }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-white/90 text-lg font-light"
              >
                {t.quote}
              </motion.p>
            </div>
          </motion.div>

          {/* Couple Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative rounded-2xl p-6 mb-6 overflow-hidden "
            style={{
              backgroundImage: `url(${sectionBackgrounds.couple})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0  rounded-2xl"></div>
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-2xl md:text-3xl text-white font-semibold mb-6 text-center"
              >
                <span className="block text-blue-700 mb-3 text-4xl">
                  {t.groom}
                </span>
                <motion.div
                  className="text-4xl my-4"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  💞
                </motion.div>
                <span className="block text-green-500 mt-3 text-4xl">
                  {t.bride}
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-white/90 text-lg leading-relaxed text-center italic font-light"
              >
                {t.message}
              </motion.p>
            </div>

                <div className="absolute inset-0 bg-gradient-to-r from-black via-white/10 to-black animate-fog-gradient opacity-90 z-50"></div>

                <div className="absolute inset-0 bg-gradient-to-tr from-black via-white/10 to-black animate-fog-gradient2  opacity-90 z-50"></div>

          </motion.div>

          {/* Countdown Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative rounded-2xl p-6 mb-6 bg-gradient-to-br from-rose-900/70 to-purple-900/70 backdrop-blur-sm border border-white/20"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-rose-300 mb-4">
              {t.countdown}
            </h2>
            
            {!timeLeft.finished ? (
              <div className="flex justify-center gap-3 flex-wrap">
                {['days', 'hours', 'minutes', 'seconds'].map((key) => (
                  <div
                    key={key}
                    className="bg-white/15 rounded-xl px-4 py-3 min-w-[70px] backdrop-blur-sm border border-white/10"
                  >
                    <p className="text-rose-300 text-2xl font-bold">
                      {timeLeft[key] ?? '--'}
                    </p>
                    <p className="text-sm text-white/80 mt-1 font-light">
                      {t[key]}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-xl text-rose-400 font-semibold"
              >
                {t.finished}
              </motion.p>
            )}
          </motion.div>

          {/* Date & Location Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="grid md:grid-cols-2 gap-6 mb-6"
          >
            {/* Date Section */}
            <motion.div
              className="relative rounded-2xl p-6 overflow-hidden bg-amber-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-orange-900/60 rounded-2xl"></div>
              <div className="relative z-10">
                <FaClock className="text-3xl mb-3 text-yellow-300 mx-auto" />
                <div className="text-xl md:text-2xl font-semibold text-yellow-200 mb-2">
                  {t.date}
                </div>
                <div className="text-white/90 text-lg font-light">
                  {t.time}
                </div>
              </div>
            </motion.div>

            {/* Venue Section */}
            <motion.div
              className="relative rounded-2xl p-6 overflow-hidden bg-amber-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-purple-900/60 rounded-2xl"></div>
              <div className="relative z-10">
                <FaMapMarkerAlt className="text-3xl mb-3 text-purple-300 mx-auto" />
                <div className="text-lg md:text-xl font-semibold text-purple-200 mb-2">
                  {t.location}
                </div>
                <div className="text-white/80 text-base font-light">
                  {t.royalHall}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Central Heart Animation */}
          <motion.div
            className="my-8 flex justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <FaHeart className="text-6xl text-rose-400 drop-shadow-lg" />
          </motion.div>

          {/* Final Quote Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="relative rounded-2xl p-6 overflow-hidden"
            style={{
              backgroundImage: `url(${sectionBackgrounds.quote})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-pink-900/50 rounded-2xl"></div>
            <div className="relative z-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-white/95 text-lg leading-loose text-center font-light italic"
              >
                {lang === 'ar' 
                  ? "في هذه الليلة المباركة، حيث تلتقي القلوب وتتحد الأرواح، نحتفل ببداية رحلة حب جديدة... رحلة تبدأ بوعود وتستمر بذكريات جميلة ترويها الأيام، وتنتهي بخلود في جنات النعيم"
                  : "In this blessed night, where hearts meet and souls unite, we celebrate the beginning of a new love journey... A journey that begins with promises and continues with beautiful memories told by the days, and ends with eternity in paradise"
                }
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Music Control Button */}
      <motion.button
        onClick={toggleMusic}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-purple-600 to-pink-600 text-white p-3 rounded-xl shadow-xl border border-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8 }}
        style={{
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              rotate: isPlaying ? 360 : 0,
            }}
            transition={{
              duration: isPlaying ? 2 : 0.3,
              repeat: isPlaying ? Infinity : 0,
            }}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </motion.div>
        </div>
      </motion.button>

      {/* Music Hint */}
      <AnimatePresence>
        {showMusicHint && !userInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-20 z-50 bg-black/80 backdrop-blur-md text-white p-3 rounded-xl border border-white/20 max-w-xs"
            style={{
              WebkitTransform: 'translate3d(0,0,0)',
              transform: 'translate3d(0,0,0)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">🎵</div>
              <div>
                <p className="text-sm font-medium">{t.clickAnywhere}</p>
                <p className="text-xs text-white/70">{t.startMusic}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RSVP Button */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-rose-500 to-yellow-400 text-white px-8 py-4 rounded-xl shadow-xl border border-yellow-300 font-semibold hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        style={{
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">💌</span>
          <span>{t.rsvp}</span>
        </div>
      </motion.button>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-8 mb-24 text-white/80 text-sm z-10 text-center"
        style={{
          WebkitTransform: 'translate3d(0,0,0)',
          transform: 'translate3d(0,0,0)'
        }}
      >
        <p className="font-light mb-3">
          {t.finalMessage}
        </p>
        <div className="flex justify-center gap-4 text-xl">
          {['💐', '🌹', '✨'].map((icon, index) => (
            <motion.span
              key={icon}
              animate={{
                scale: [1, 1.2, 1],
              y: [0, -3, 0],
              opacity: [0.7, 1, 0.7],
              rotate: [0, 5, -5, 0],
              transition: {
                duration: 3,
                repeat: Infinity,
                delay: index * 0.5,
              },
            }}
            >
              {icon}
            </motion.span>
          ))}
        </div>
        
        <motion.div
          className="mt-4 text-rose-400 text-sm"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <FaHeart className="inline-block mx-1" /> {t.couple} <FaHeart className="inline-block mx-1" />
        </motion.div>
      </motion.div>

      {/* RSVP Modal */}
      <RSVPModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guestNumber={guestNumber}
        guestName={guestInfo?.name || t.guestName}
        lang={lang}
        guestInfo={guestInfo}
      />

      {/* Simple music notes animation */}
      <AnimatePresence>
        {isPlaying && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="fixed text-2xl z-40 pointer-events-none"
                style={{
                  left: `${20 + i * 25}%`,
                  bottom: '5%',
                }}
                initial={{ opacity: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  y: [0, -100, -200],
                  x: [0, (Math.random() - 0.5) * 40],
                  rotate: [0, 180, 360],
                  scale: [0, 1, 0.8],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeOut',
                }}
              >
                {['🎵', '🎶', '🎵'][i % 3]}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

    </div>
  )
}