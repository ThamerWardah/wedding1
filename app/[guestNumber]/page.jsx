'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaClock, FaMapMarkerAlt, FaPause, FaPlay } from 'react-icons/fa'

// RSVP Modal Component
function RSVPModal({ isOpen, onClose, guestNumber, guestName, currentResponse, lang }) {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState(null)
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)

  // Translation texts
  const translations = {
    ar: {
      title: 'هل ستشاركنا فرحتنا؟ 🎊',
      updateTitle: 'تحديث الحضور ✨',
      deadline: 'نرجو التأكد قبل ١٠ يونيو ٢٠٢٥',
      updateDeadline: 'يمكنك تحديث معلومات الحضور',
      specialInvitation: 'الدعوة خاصة بـ:',
      fullName: 'الاسم الكامل *',
      namePlaceholder: 'أدخل الاسم الكامل...',
      attendanceQuestion: 'هل ستشاركنا الحفل؟ *',
      yes: 'نعم!',
      yesLabel: 'سأحضر بالتأكيد',
      no: 'لا',
      noLabel: 'معذرة، لن أتمكن',
      guestsCount: 'عدد الضيوف',
      guestsNote: 'يشمل العدد نفسك',
      message: 'رسالة حب للعروسين 💌',
      messagePlaceholder: 'اكتب رسالة حب أو تهنئة للعروسين...',
      submit: 'تأكيد الحضور 🎉',
      update: 'تحديث الحضور ✨',
      submitting: 'جاري الإرسال... ⏳',
      later: 'سأفكر لاحقاً 💫',
      successTitle: 'شكراً جزيلاً! 🌹',
      updateSuccessTitle: 'تم التحديث! ✨',
      successMessage: 'تم تسجيل ردكم بنجاح',
      updateSuccessMessage: 'تم تحديث ردكم بنجاح',
      excitement: 'نترقب حضوركم بفارغ الصبر! 💖',
      error: 'حدث خطأ في إرسال التأكيد:',
      person: 'شخص',
      people: 'أشخاص'
    },
    en: {
      title: 'Will You Join Our Celebration? 🎊',
      updateTitle: 'Update Attendance ✨',
      deadline: 'Please confirm before June 10, 2025',
      updateDeadline: 'You can update your attendance information',
      specialInvitation: 'Special invitation for:',
      fullName: 'Full Name *',
      namePlaceholder: 'Enter your full name...',
      attendanceQuestion: 'Will you attend the ceremony? *',
      yes: 'Yes!',
      yesLabel: "I'll definitely attend",
      no: 'No',
      noLabel: "Sorry, I can't make it",
      guestsCount: 'Number of Guests',
      guestsNote: 'Includes yourself',
      message: 'Love Message for the Couple 💌',
      messagePlaceholder: 'Write a love message or congratulations for the couple...',
      submit: 'Confirm Attendance 🎉',
      update: 'Update Attendance ✨',
      submitting: 'Submitting... ⏳',
      later: 'I will think later 💫',
      successTitle: 'Thank You! 🌹',
      updateSuccessTitle: 'Updated! ✨',
      successMessage: 'Your response has been recorded successfully',
      updateSuccessMessage: 'Your response has been updated successfully',
      excitement: "We're excited to see you! 💖",
      error: 'Error submitting RSVP:',
      person: 'person',
      people: 'people'
    }
  }

  const t = translations[lang]
  const isRTL = lang === 'ar'

  // Initialize form with current response if available
  useEffect(() => {
    if (currentResponse) {
      setAttending(currentResponse.attending ? 'yes' : 'no')
      setGuests(currentResponse.guestsCount || 1)
      setMessage(currentResponse.message || '')
      setIsUpdate(true)
    } else {
      setAttending(null)
      setGuests(1)
      setMessage('')
      setIsUpdate(false)
    }
    
    if (guestName) {
      setName(guestName)
    }
  }, [currentResponse, guestName])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !attending) return

    setIsSubmitting(true)
    
    try {
      const rsvpData = {
        name,
        attending: attending === 'yes',
        guestsCount: attending === 'yes' ? guests : 0,
        message
      }

      let response
      
      if (guestNumber) {
        response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...rsvpData,
            guestNumber
          }),
        })
      } else {
        response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rsvpData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit RSVP')
      }

      setIsSubmitted(true)
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        resetForm()
      }, 3000)
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      alert(`${t.error} ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setAttending(null)
    setGuests(1)
    setMessage('')
    setIsUpdate(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto border border-white/60"
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Elegant Border Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-100/50 to-pink-100/50 p-[1px] -z-10">
              <div className="w-full h-full rounded-3xl bg-transparent"></div>
            </div>

            {isSubmitted ? (
              <div className="p-6 text-center relative z-10">
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <motion.svg 
                    className="w-10 h-10 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                </motion.div>
                
                {/* Success Text */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4"
                >
                  {isUpdate ? t.updateSuccessTitle : t.successTitle}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-700 text-base mb-6 leading-relaxed"
                >
                  {isUpdate ? t.updateSuccessMessage : t.successMessage}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 rounded-2xl border border-emerald-200 inline-flex items-center gap-2 shadow-sm"
                >
                  <span className="text-xl">💖</span>
                  <span className="text-emerald-700 font-semibold text-sm">
                    {t.excitement}
                  </span>
                </motion.div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {isUpdate ? t.updateTitle : t.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {isUpdate ? t.updateDeadline : t.deadline}
                  </p>
                  
                  {guestName && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 shadow-sm mb-4"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-xl text-blue-500">👑</div>
                        <div className="text-center">
                          <p className="text-blue-700 font-semibold text-xs">{t.specialInvitation}</p>
                          <p className="text-blue-800 font-bold text-sm">{guestName}</p>
                        </div>
                        <div className="text-xl text-blue-400">💫</div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Name Input */}
                  {!guestName && (
                    <motion.div
                      initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.fullName}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all duration-300 text-base shadow-sm"
                          placeholder={t.namePlaceholder}
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Attendance Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t.attendanceQuestion}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Yes Button */}
                      <motion.button
                        type="button"
                        onClick={() => setAttending('yes')}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                          attending === 'yes' 
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700 shadow-lg' 
                            : 'border-gray-200 bg-white/80 hover:border-emerald-300 text-gray-700'
                        }`}
                      >
                        <div className="relative z-10">
                          <div className="text-2xl mb-1">🎉</div>
                          <div className="font-bold text-base">{t.yes}</div>
                          <div className="text-xs text-gray-600">{t.yesLabel}</div>
                        </div>
                      </motion.button>

                      {/* No Button */}
                      <motion.button
                        type="button"
                        onClick={() => setAttending('no')}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                          attending === 'no' 
                            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 shadow-lg' 
                            : 'border-gray-200 bg-white/80 hover:border-amber-300 text-gray-700'
                        }`}
                      >
                        <div className="relative z-10">
                          <div className="text-2xl mb-1">💫</div>
                          <div className="font-bold text-base">{t.no}</div>
                          <div className="text-xs text-gray-600">{t.noLabel}</div>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Number of Guests */}
                  {attending === 'yes' && (
                    <motion.div
                      initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.guestsCount}
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all duration-300 shadow-sm appearance-none"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {guestOptions.map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? t.person : t.people}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {t.guestsNote}
                      </p>
                    </motion.div>
                  )}

                  {/* Message */}
                  <motion.div
                    initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.message}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all duration-300 resize-none shadow-sm"
                      placeholder={t.messagePlaceholder}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={!name || !attending || isSubmitting}
                      whileTap={(!isSubmitting && name && attending) ? { scale: 0.98 } : {}}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            {t.submitting}
                          </>
                        ) : (
                          <>
                            <span>{isUpdate ? '✨' : '🎉'}</span>
                            {isUpdate ? t.update : t.submit}
                          </>
                        )}
                      </span>
                    </motion.button>

                    {/* Later Button */}
                    <motion.button
                      type="button"
                      onClick={handleClose}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-gray-600 py-3 rounded-2xl font-medium hover:text-gray-700 hover:bg-gray-50/80 transition-all duration-200 border border-gray-300 shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>💫</span>
                        {t.later}
                      </span>
                    </motion.button>
                  </motion.div>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Main Wedding Component
export default function WeddingCelebrationArabic() {
  const params = useParams()
  const guestNumber = params?.guestNumber
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [weddingSettings, setWeddingSettings] = useState(null)
  const [guestInfo, setGuestInfo] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showMusicHint, setShowMusicHint] = useState(true)
  const [lang, setLang] = useState('ar')
  const [timeLeft, setTimeLeft] = useState({})
  const [audioReady, setAudioReady] = useState(false)
  const audioRef = useRef(null)

  // Wedding date
  const WEDDING_DATE = new Date('2025-12-19T19:00:00')

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

  // Initialize audio with proper iOS/Android compatibility
  const initializeAudio = useCallback(() => {
    if (audioRef.current) {
      // Universal mobile audio settings
      audioRef.current.preload = 'auto'
      audioRef.current.playsInline = true
      audioRef.current.setAttribute('webkit-playsinline', 'true')
      audioRef.current.setAttribute('playsinline', 'true')
      audioRef.current.volume = 0.8
      audioRef.current.muted = false
      
      // Load the audio
      audioRef.current.load()
      
      console.log('Audio initialized for mobile')
      setAudioReady(true)
      return true
    }
    return false
  }, [])

  // Universal user interaction handler for iOS & Android
  const handleUserInteraction = useCallback(async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!userInteracted) {
      setUserInteracted(true)
      setShowMusicHint(false)
      
      console.log('First user interaction detected')
      
      // Initialize audio on first interaction
      const audioInitialized = initializeAudio()
      
      if (audioInitialized && audioRef.current) {
        try {
          // Small delay to ensure audio is ready
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const playPromise = audioRef.current.play()
          
          if (playPromise !== undefined) {
            await playPromise
            console.log('Audio started successfully on first interaction')
            setIsPlaying(true)
          }
        } catch (error) {
          console.log('First interaction audio play failed:', error)
          // Silent fail - user can use music button later
        }
      }
    }
  }, [userInteracted, initializeAudio])

  // Enhanced audio initialization
  useEffect(() => {
    if (isLoaded) {
      // Pre-initialize audio but don't play until user interaction
      initializeAudio()
    }
  }, [isLoaded, initializeAudio])

  // Fetch wedding settings and guest info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsResponse = await fetch('/api/settings')
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json()
          setWeddingSettings(settings)
        }

        if (guestNumber) {
          const guestResponse = await fetch(`/api/guests/${guestNumber}`)
          if (guestResponse.ok) {
            const guestData = await guestResponse.json()
            setGuestInfo(guestData)
          } else {
            setGuestInfo({ name: t.guestName, number: guestNumber })
          }
        } else {
          setGuestInfo({ name: t.guestName, number: '000' })
        }
      } catch (error) {
        setGuestInfo({ name: t.guestName, number: guestNumber || '000' })
      }
    }

    if (isLoaded) {
      fetchData()
    }
  }, [isLoaded, guestNumber, t.guestName])

  // Preload function
  const preloadAssets = useCallback(async () => {
    try {
      // Simple loading simulation
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsLoaded(true)
    } catch (error) {
      setIsLoaded(true)
    }
  }, [])

  // Preload all assets
  useEffect(() => {
    preloadAssets()
  }, [preloadAssets])

  // Auto-open modal after 30 seconds
  useEffect(() => {
    if (!isLoaded) return

    const timer = setTimeout(() => {
      console.log('Auto-opening RSVP modal after 30 seconds')
      setIsModalOpen(true)
    }, 30000)

    return () => clearTimeout(timer)
  }, [isLoaded])

  // Enhanced music control functions
  const toggleMusic = useCallback(async (e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    if (!userInteracted) {
      // If first interaction is through music button, trigger the interaction flow
      await handleUserInteraction()
    }

    if (audioRef.current && audioReady) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        try {
          const playPromise = audioRef.current.play()
          
          if (playPromise !== undefined) {
            await playPromise
            setIsPlaying(true)
          }
        } catch (error) {
          console.log('Music toggle play failed:', error)
        }
      }
    }
  }, [userInteracted, isPlaying, audioReady, handleUserInteraction])

  // Hide music hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMusicHint(false)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  // Show elegant loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
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
            className="text-6xl text-rose-400 mb-6"
          >
            💍
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl text-rose-600 font-arabic mb-4 font-light"
          >
            {t.loading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-rose-500/70 text-base font-arabic"
          >
            {t.preparing}
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative min-h-screen overflow-x-hidden flex flex-col items-center justify-center text-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-4 py-4 select-none"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Hidden Audio Element with universal mobile optimizations */}
      <audio
        ref={audioRef}
        src={songs[currentSongIndex]}
        loop={false}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onLoadedMetadata={() => {
          console.log('Audio metadata loaded')
          setAudioReady(true)
        }}
        onError={(e) => {
          console.error('Audio error:', e)
        }}
      />

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_50%)]"></div>

      {/* Language Switch Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          setLang(lang === 'ar' ? 'en' : 'ar')
        }}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-md text-rose-600 px-3 py-2 rounded-full text-xs hover:bg-white transition-all duration-300 border border-rose-200 font-medium shadow-sm"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {t.switch}
      </motion.button>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto space-y-4 mb-24">
        {/* Guest Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg"
        >
          <motion.h3 className="text-lg text-rose-700/90 font-light mb-2">
            {t.welcome}
          </motion.h3>
          <motion.h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {guestInfo?.name || t.guestName}
          </motion.h2>
          {guestInfo?.number && (
            <motion.p className="text-rose-500/70 text-xs mt-2">
              #{guestInfo.number}
            </motion.p>
          )}
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg"
        >
          <motion.h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {t.title}
          </motion.h1>
          <motion.p className="text-rose-700/90 text-base font-light leading-relaxed">
            {t.quote}
          </motion.p>
        </motion.div>

        {/* Couple Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg"
        >
          <motion.h2 className="text-2xl text-rose-800 font-semibold mb-6 text-center">
            <span className="block text-amber-600 mb-3 text-xl">{t.groom}</span>
            <div className="text-3xl my-4 text-rose-500">💞</div>
            <span className="block text-pink-600 mt-3 text-xl">{t.bride}</span>
          </motion.h2>
          <motion.p className="text-rose-700/90 text-base leading-relaxed text-center italic">
            {t.message}
          </motion.p>
        </motion.div>

        {/* Countdown Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-rose-700 mb-6">
            {t.countdown}
          </h2>
          
          {!timeLeft.finished ? (
            <div className="flex justify-center gap-3 flex-wrap">
              {['days', 'hours', 'minutes', 'seconds'].map((key) => (
                <div key={key} className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[70px] border border-white/40">
                  <p className="text-rose-600 text-2xl font-bold">
                    {timeLeft[key] ?? '--'}
                  </p>
                  <p className="text-rose-500/80 text-sm mt-1">
                    {t[key]}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <motion.p className="text-xl text-rose-600 font-semibold">
              {t.finished}
            </motion.p>
          )}
        </motion.div>

        {/* Date & Location Sections */}
        <div className="grid gap-4">
          {/* Date Section */}
          <motion.div
            className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg"
          >
            <FaClock className="text-3xl mb-3 text-amber-500 mx-auto" />
            <div className="text-xl font-semibold text-amber-700 mb-2">
              {t.date}
            </div>
            <div className="text-amber-600/90 text-base">
              {t.time}
            </div>
          </motion.div>

          {/* Venue Section */}
          <motion.div
            className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg"
          >
            <FaMapMarkerAlt className="text-3xl mb-3 text-blue-500 mx-auto" />
            <div className="text-lg font-semibold text-blue-700 mb-2">
              {t.location}
            </div>
            <div className="text-blue-600/80 text-sm">
              {t.royalHall}
            </div>
          </motion.div>
        </div>

        {/* Final Quote Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg"
        >
          <motion.p className="text-rose-700/95 text-base leading-loose text-center font-light italic">
            {lang === 'ar' 
              ? "في هذه الليلة المباركة، حيث تلتقي القلوب وتتحد الأرواح، نحتفل ببداية رحلة حب جديدة... رحلة تبدأ بوعود وتستمر بذكريات جميلة ترويها الأيام، وتنتهي بخلود في جنات النعيم"
              : "In this blessed night, where hearts meet and souls unite, we celebrate the beginning of a new love journey... A journey that begins with promises and continues with beautiful memories told by the days, and ends with eternity in paradise"
            }
          </motion.p>
        </motion.div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl py-4 px-6 border-t border-rose-200/50 shadow-2xl">
        <div className="max-w-lg mx-auto flex justify-between items-center gap-4">
          {/* Music Control Button */}
          <motion.button
            onClick={toggleMusic}
            className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-xl border border-white/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 min-h-[52px]"
            whileTap={{ scale: 0.95 }}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: isPlaying ? 2 : 0.3, repeat: isPlaying ? Infinity : 0 }}
            >
              {isPlaying ? <FaPause className="text-base" /> : <FaPlay className="text-base" />}
            </motion.div>
            <span className="font-semibold text-sm">
              {isPlaying ? t.pauseMusic : t.playMusic}
            </span>
          </motion.button>

          {/* RSVP Button */}
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 bg-gradient-to-br from-rose-500 to-pink-500 text-white p-4 rounded-2xl shadow-xl border border-white/20 font-bold active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 min-h-[52px]"
            whileTap={{ scale: 0.95 }}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="text-lg">💌</span>
            <span className="text-base">{t.rsvp}</span>
          </motion.button>
        </div>
      </div>

      {/* Music Hint */}
      <AnimatePresence>
        {showMusicHint && !userInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 z-50 bg-white/95 backdrop-blur-md text-rose-700 p-4 rounded-2xl border border-rose-200 max-w-[300px] shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg text-rose-500">🎵</div>
              <div>
                <p className="text-sm font-semibold">{t.clickAnywhere}</p>
                <p className="text-xs text-rose-500/70 mt-1">{t.startMusic}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 mb-32 text-rose-600/80 text-sm text-center"
      >
        <p className="font-light mb-3 text-base">
          {t.finalMessage}
        </p>
        <div className="flex justify-center gap-4 text-xl">
          {['💐', '🌹', '✨'].map((icon) => (
            <motion.span
              key={icon}
              animate={{ scale: [1, 1.2, 1], y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {icon}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Fixed RSVP Modal */}
      <RSVPModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guestNumber={guestInfo?.number}
        guestName={guestInfo?.name || t.guestName}
        lang={lang}
      />
    </div>
  )
}