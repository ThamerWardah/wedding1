'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function RSVPModal({ 
  isOpen, 
  onClose, 
  guestNumber, 
  guestName, 
  currentResponse,
  lang,
  guestInfo
}) {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState(null);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

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
      people: 'أشخاص',
      required: 'مطلوب'
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
      people: 'people',
      required: 'required'
    }
  };

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Initialize form with current response if available
  useEffect(() => {
    if (currentResponse) {
      setAttending(currentResponse.attending ? 'yes' : 'no');
      setGuests(currentResponse.guestsCount || 1);
      setMessage(currentResponse.message || '');
      setIsUpdate(true);
    } else {
      setAttending(null);
      setGuests(1);
      setMessage('');
      setIsUpdate(false);
    }
    
    if (guestName) {
      setName(guestName);
    }
  }, [currentResponse, guestName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
      console.log(JSON.stringify(guestInfo))
    if (!name || !attending) return;

    setIsSubmitting(true);
    
    try {
      const rsvpData = {
        name,
        attending: attending === 'yes',
        guestsCount: attending === 'yes' ? guests : 0,
        message
      };

      let response;
      
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
        });
      } else {
        response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rsvpData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit RSVP');
      }

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        resetForm();
      }, 3000);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert(`${t.error} ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAttending(null);
    setGuests(1);
    setMessage('');
    setIsUpdate(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-gradient-to-br from-white via-rose-50 to-pink-50 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-white/50 backdrop-blur-lg"
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
              boxShadow: '0 25px 50px -12px rgba(190, 24, 93, 0.25), 0 0 30px rgba(236, 72, 153, 0.1)'
            }}
          >
            {/* Static Decorative Elements */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-lg"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-lg"></div>

            {/* Main Gradient Border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 p-0.5 -z-10">
              <div className="w-full h-full rounded-3xl bg-white/20 backdrop-blur-sm"></div>
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center relative z-10">
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden"
                >
                  <motion.svg 
                    className="w-12 h-12 text-white relative z-10" 
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
                  className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-4"
                  style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
                >
                  {isUpdate ? t.updateSuccessTitle : t.successTitle}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-700 text-lg mb-6 leading-relaxed"
                  style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
                >
                  {isUpdate ? t.updateSuccessMessage : t.successMessage}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 rounded-2xl border border-green-200 inline-flex items-center gap-3 shadow-lg"
                >
                  <span className="text-2xl">💖</span>
                  <span className="text-green-700 font-semibold text-lg">
                    {t.excitement}
                  </span>
                </motion.div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 md:p-8 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-8">
                  {/* Title */}
                  <div className="relative inline-block mb-4">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-200/40 to-purple-200/40 rounded-full blur-xl"></div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent relative z-10">
                      {isUpdate ? t.updateTitle : t.title}
                    </h2>
                  </div>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 text-lg mb-6"
                    style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
                  >
                    {isUpdate ? t.updateDeadline : t.deadline}
                  </motion.p>
                  
                  {/* Special Invitation Badge */}
                  {guestName && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-200/80 rounded-2xl p-4 shadow-lg mb-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-2xl">👑</div>
                        <div className="text-center">
                          <p className="text-blue-800 font-semibold text-sm">{t.specialInvitation}</p>
                          <p className="text-blue-900 font-bold text-lg">{guestName}</p>
                        </div>
                        <div className="text-2xl">💫</div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Name Input */}
                  {!guestName && (
                    <motion.div
                      initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        {t.fullName}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-pink-400/50 focus:border-pink-400 transition-all duration-300 text-lg bg-white/80 shadow-sm hover:shadow-md backdrop-blur-sm"
                          placeholder={t.namePlaceholder}
                          dir={isRTL ? 'rtl' : 'ltr'}
                          style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
                        />
                        <div className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-400">
                          👤
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Attendance Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      {t.attendanceQuestion}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Yes Button */}
                      <motion.button
                        type="button"
                        onClick={() => setAttending('yes')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-5 rounded-2xl border-3 transition-all duration-300 relative overflow-hidden ${
                          attending === 'yes' 
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 shadow-xl' 
                            : 'border-gray-200 bg-white/80 hover:border-green-300 hover:shadow-lg text-gray-700 backdrop-blur-sm'
                        }`}
                      >
                        {/* Animated background */}
                        {attending === 'yes' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 to-emerald-100/80" />
                        )}
                        
                        <div className="relative z-10">
                          <div className="text-3xl mb-2">🎉</div>
                          <div className="font-bold text-xl mb-1">{t.yes}</div>
                          <div className="text-sm text-gray-600">{t.yesLabel}</div>
                        </div>

                        {/* Selection indicator */}
                        {attending === 'yes' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </motion.button>

                      {/* No Button */}
                      <motion.button
                        type="button"
                        onClick={() => setAttending('no')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-5 rounded-2xl border-3 transition-all duration-300 relative overflow-hidden ${
                          attending === 'no' 
                            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 shadow-xl' 
                            : 'border-gray-200 bg-white/80 hover:border-amber-300 hover:shadow-lg text-gray-700 backdrop-blur-sm'
                        }`}
                      >
                        {/* Animated background */}
                        {attending === 'no' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 to-orange-100/80" />
                        )}
                        
                        <div className="relative z-10">
                          <div className="text-3xl mb-2">💫</div>
                          <div className="font-bold text-xl mb-1">{t.no}</div>
                          <div className="text-sm text-gray-600">{t.noLabel}</div>
                        </div>

                        {/* Selection indicator */}
                        {attending === 'no' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
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
                      <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        {t.guestsCount}
                      </label>
                      <div className="relative">
                        <select
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-pink-400/50 focus:border-pink-400 transition-all duration-300 bg-white/80 shadow-sm hover:shadow-md appearance-none backdrop-blur-sm"
                          dir={isRTL ? 'rtl' : 'ltr'}
                          style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
                        >
                          {guestOptions.map(num => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? t.person : t.people}
                            </option>
                          ))}
                        </select>
                        <div className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-400">
                          👥
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2" style={{ textAlign: isRTL ? 'right' : 'left' }}>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      {t.message}
                    </label>
                    <div className="relative">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-pink-400/50 focus:border-pink-400 transition-all duration-300 resize-none bg-white/80 shadow-sm hover:shadow-md backdrop-blur-sm"
                        placeholder={t.messagePlaceholder}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
                      />
                      <div className="absolute top-4 right-4 text-gray-400">
                        💝
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={!name || !attending || isSubmitting}
                      whileHover={(!isSubmitting && name && attending) ? { scale: 1.02 } : {}}
                      whileTap={(!isSubmitting && name && attending) ? { scale: 0.98 } : {}}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-5 rounded-2xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl relative overflow-hidden group"
                      style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 -inset-x-40 bg-gradient-to-r from-transparent via-white/30 to-transparent transform rotate-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
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
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-gray-600 py-4 rounded-2xl font-semibold hover:text-gray-800 hover:bg-gray-50/80 transition-all duration-200 border-2 border-gray-200/80 shadow-sm backdrop-blur-sm"
                      style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
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
  );
}