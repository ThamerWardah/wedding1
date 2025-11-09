'use client'

import RSVPModal from "@/components/RSVPModal4";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Light(){
    const params = useParams()
  const guestNumber = params?.guestNumber

  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showMusicHint, setShowMusicHint] = useState(true)
  const [lang, setLang] = useState('ar')
  const [timeLeft, setTimeLeft] = useState({})
  const [audioReady, setAudioReady] = useState(true)
  const [isIOS, setIsIOS] = useState(false)
  const [isRSVPOpen, setIsRSVPOpen] = useState(false)
  const [guestInfo, setGuestInfo] = useState(null)
  const [isLoadingGuest, setIsLoadingGuest] = useState(false)
  const audioRef = useRef(null)

  // Wedding date
  const WEDDING_DATE = new Date('2025-12-19T19:00:00')


  // Fetch guest information when guestNumber is available
  useEffect(() => {
    const fetchGuestInfo = async () => {
      if (guestNumber) {
        setIsLoadingGuest(true)
        try {
          const response = await fetch(`/api/guests/${guestNumber}`)
          if (response.ok) {
            const guestData = await response.json()
            setGuestInfo(guestData)
          }
        } catch (error) {
          console.error('Error fetching guest info:', error)
        } finally {
          setIsLoadingGuest(false)
        }
      }
    }

    fetchGuestInfo()
  }, [guestNumber])

    // Auto-open modal after 5 seconds
  useEffect(() => {
    setTimeout(() =>showNotshow(), 10000)
  }, [guestInfo?.name])
const showNotshow = ()=>{
  if(guestInfo!==null){
  !guestInfo?.attendance?.attending?setIsRSVPOpen(true):null}
  }

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

  // Translation texts
  const t = useMemo(() => ({
    ar: {
      title: 'افراح العتيبي والظاهر',
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
      updateRsvp:'تحديث الحضور',
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
      updateRsvp:'Update RSVP',
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
      if (audioRef.current ) {
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
      }
    }

    if (isLoaded) {
      initializeAudio()
    }
  }, [isLoaded, isIOS])

  // Enhanced preload function for iOS compatibility
  const preloadAssets = useCallback(async () => {
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

  }, [ songs])

  // Preload all assets
  useEffect(() => {
    preloadAssets()
  }, [preloadAssets])

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

  // Toggle language function
  const toggleLanguage = useCallback(() => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar')
  }, [])

  // Open RSVP modal function
  const openRSVPModal = useCallback(() => {
    setIsRSVPOpen(true)
  }, [])

  return (
    <div 
      className="bg-white w-screen min-h-screen text-blue-600 font-extrabold flex flex-col justify-center items-end p-2 gap-4"
      onClick={handleUserInteraction}
      onTouchStart={handleTouchStart}
      onKeyDown={handleUserInteraction}
      role="button"
      tabIndex={0}
      style={{
        fontFamily: "Amiri, serif",
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
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

      {/* Control Buttons - Fixed Position */}
      <div className="fixed bottom-2 left-4 z-[2000] flex flex-row gap-2">
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:bg-white transition-all duration-200"
          style={{ color: '#8B7355' }}
        >
          {t.switch}
        </button>

        {/* Music Toggle Button */}
        <button
          onClick={toggleMusic}
          className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:bg-white transition-all duration-200 flex items-center gap-2"
          style={{ color: '#8B7355' }}
        >
          <span>{isPlaying ? '⏸️' : '🎵'}</span>
          {isPlaying ? t.pauseMusic : t.playMusic}
        </button>

        {/* Manual RSVP Button */}
        <button
          onClick={openRSVPModal}
          className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:bg-white transition-all duration-200"
          style={{ color: '#8B7355' }}
        >
          {!guestInfo?.attendance?.attending?t.rsvp:t.updateRsvp}
        </button>
      </div>

      {/* Guest Welcome Message */}
      {guestInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 6 }}
          className="fixed top-4 right-4 z-50 bg-white/5 backdrop-blur-xs rounded-lg p-4 shadow-lg border"
        >
          <p className="text-sm font-semibold bg-transparent" style={{ color: '#2F4F4F' }}>
            {t.welcome}
          </p>
          <p className="text-lg font-bold bg-transparent" style={{ color: '#B8860B' }}>
            {guestInfo.name}
          </p>
        </motion.div>
      )}

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative rounded-2xl p-6 mb-6 overflow-hidden w-6/8 z-60 shadow-xl shadow-[#F5F5DC] min-h-[100px] text-center"
      >
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            backgroundImage: `url(./h2.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="relative z-10">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="text-xl md:text-5xl font-bold mb-4 text-center text-red-900"
            style={{ fontFamily: "Amiri, serif" }}
          >
            {t.title}
          </motion.h1>
          <motion.div
            className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full w-48 mx-auto my-4 animate-pulse"
            initial={{ width: 0 }}
            animate={{ width: 192 }}
            transition={{ delay: 0.8, duration: 1 }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-black font-semibold text-s"
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
        className="relative rounded-2xl p-5 mb-6 overflow-hidden w-6/8 z-60 shadow-xl shadow-[#F5F5DC] min-h-[240px] flex items-end"
        style={{
          backgroundImage: `url(./h4.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 rounded-2xl"></div>
        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-2xl md:text-3xl text-white font-semibold mb-6 text-center"
          >
            <span className="block text-blue-700 mb-3 text-4xl">
              {/*{t.groom} */}
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
              {/*💞 */}
            </motion.div>
            <span className="block text-green-500 mt-3 text-4xl">
              {/* {t.bride} */}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-black/90 text-lg font-semibold leading-relaxed text-center italic"
          >
            {/* {t.message} */}
          </motion.p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black via-white/10 to-black animate-fog-gradient opacity-90 z-50"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-white/10 to-black animate-fog-gradient2 opacity-90 z-50"></div>
      </motion.div>

      {/* Countdown Section */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.9 }}
  style={{
    backgroundImage: `url(./h2.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
  className="relative rounded-2xl text-gray-600 p-1 pb-2 mb-6 border border-white/20 w-6/8 z-60 shadow-xl shadow-[#F5F5DC]"
>
  {/* Simple Wedding Date - Matching Countdown Style */}
  <div className="text-center mb-4 mt-2">
    <div className="bg-white/10 rounded-lg px-4 py-2 inline-flex items-center gap-2 backdrop-blur-sm border border-white/10">
      <span className="text-white font-semibold text-lg">
        {lang === 'ar' ? '١٩ ديسمبر ٢٠٢٥ - ٧:٠٠ مساءً' : 'December 19, 2025 - 7:00 PM'}
      </span>
    </div>
  </div>

  <h2 className="text-lg text-center md:text-xl font-semibold text-gray-500 mb-4">
    {t.countdown}
  </h2>
  
  {!timeLeft.finished ? (
    <div className="flex justify-center gap-1 flex-wrap">
      {['days', 'hours', 'minutes', 'seconds'].map((key) => (
        <div
          key={key}
          className="bg-white/15 rounded-lg px-2 text-center py-3 min-w-[50px] backdrop-blur-sm border border-white/10"
        >
          <p className="text-lg font-bold text-white">
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

      {/* Location Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{
          backgroundImage: `url(./h2.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="relative rounded-2xl p-1 pb-2 mb-20 min-h-[100px] border border-white/20 w-6/8 z-60 shadow-xl shadow-[#F5F5DC] text-center flex justify-center items-center text-blue-900 text-lg"
      >
        {t.location}
      </motion.div>

      <div className="fixed z-10 bg-[url('/h1.jpg')] inset-0 bg-cover bg-center w-2/5 h-screen">
        <div className="absolute right-0 inset-0 bg-gradient-to-l from-transparent to-white border-0"></div>
      </div>

      <div className="fixed inset-0 bg-gradient-to-l from-white via-white/10 to-transparent animate-fog-gradient3 z-100"></div>
      

      {/* for the ios when swap the screen from bottom to up to show wight bg */}
      <div className="fixed inset-0 bg-white 3 z-0 w-screen h-screen"></div>

      {/* RSVP Modal */}
      <RSVPModal 
        onClose={() => setIsRSVPOpen(false)}
        lang={lang}
        isOpen={isRSVPOpen}
        guestNumber={guestNumber}
        guestName={guestInfo?.name}
        currentResponse={guestInfo?.response}
      />
    </div>
  )
}