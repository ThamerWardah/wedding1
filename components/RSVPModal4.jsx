'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function RSVPModal({ 
  isOpen, 
  onClose, 
  guestNumber, 
  guestName, 
  currentResponse,
  lang
}) {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState(null);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  // Classic color palette
  const colors = {
    primary: '#8B7355', // Classic bronze
    secondary: '#2F4F4F', // Dark slate
    accent: '#B8860B', // Golden rod
    background: '#FAF9F6', // Classic white
    border: '#D2B48C', // Tan border
    text: '#36454F', // Charcoal gray
    success: '#228B22', // Forest green
    error: '#8B0000' // Dark red
  };

  // Translation texts
  const translations = {
    ar: {
      title: 'هل ستشاركنا فرحتنا؟',
      updateTitle: 'تحديث الحضور',
      deadline: 'نرجو التأكد قبل  ٥ ديسمبر٢٠٢٥', 
      updateDeadline: 'يمكنك تحديث معلومات الحضور',
      specialInvitation: 'الدعوة خاصة بـ:',
      fullName: 'الاسم الكامل *',
      namePlaceholder: 'أدخل الاسم الكامل...',
      attendanceQuestion: 'هل ستشاركنا الحفل؟ *',
      yes: 'نعم',
      yesLabel: 'سأحضر بالتأكيد',
      no: 'لا',
      noLabel: 'معذرة، لن أتمكن',
      guestsCount: 'عدد الضيوف',
      guestsNote: 'يشمل العدد نفسك',
      message: 'رسالة للعروسين',
      messagePlaceholder: 'اكتب رسالة تهنئة للعروسين...',
      submit: 'تأكيد الحضور',
      update: 'تحديث الحضور',
      submitting: 'جاري الإرسال...',
      later: 'سأفكر لاحقاً',
      successTitle: 'شكراً جزيلاً!',
      updateSuccessTitle: 'تم التحديث!',
      successMessage: 'تم تسجيل ردكم بنجاح',
      updateSuccessMessage: 'تم تحديث ردكم بنجاح',
      excitement: 'نترقب حضوركم بفارغ الصبر!',
      error: 'حدث خطأ في إرسال التأكيد:',
      person: 'شخص',
      people: 'أشخاص',
      required: 'مطلوب',
      childrenInfo: 'ضيفنا الكريم',
      childrenNote: 'لضمان استمتاع جميع الضيوف بالحفل، نرجو أن يكون هذا اليوم للكبار فقط'
    },
    en: {
      title: 'Will You Join Our Celebration?',
      updateTitle: 'Update Attendance',
      deadline: 'Please confirm before June 10, 2025',
      updateDeadline: 'You can update your attendance information',
      specialInvitation: 'Special invitation for:',
      fullName: 'Full Name *',
      namePlaceholder: 'Enter your full name...',
      attendanceQuestion: 'Will you attend the ceremony? *',
      yes: 'Yes',
      yesLabel: "I'll definitely attend",
      no: 'No',
      noLabel: "Sorry, I can't make it",
      guestsCount: 'Number of Guests',
      guestsNote: 'Includes yourself',
      message: 'Message for the Couple',
      messagePlaceholder: 'Write a congratulations message for the couple...',
      submit: 'Confirm Attendance',
      update: 'Update Attendance',
      submitting: 'Submitting...',
      later: 'I will think later',
      successTitle: 'Thank You!',
      updateSuccessTitle: 'Updated!',
      successMessage: 'Your response has been recorded successfully',
      updateSuccessMessage: 'Your response has been updated successfully',
      excitement: "We're excited to see you!",
      error: 'Error submitting RSVP:',
      person: 'person',
      people: 'people',
      childrenInfo: 'Our Honored Guest',
      childrenNote: 'To ensure all guests can relax and enjoy the celebration, we kindly request this to be an adults-only occasion',
      required: 'required'
    }
  };

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Initialize form with current response if available - only when modal opens or currentResponse changes
  useEffect(() => {
    if (isOpen) {
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
      } else {
        setName('');
      }
    }
  }, [currentResponse, guestName, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasValidName = guestName || name.trim();
    if (!hasValidName || !attending) return;

    setIsSubmitting(true);
    
    try {
      const rsvpData = {
        name: guestName || name,
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
        onClose(true); // Pass true to indicate successful submission
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Network error. Please check your connection and try again.'
        : error.message;
      alert(`${t.error} ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Don't reset form data - keep it for next time modal opens
    onClose(false); // Pass false to indicate no submission
  };

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Prevent event propagation for form elements
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          {/* Floating Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3
            }}
            className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto border"
            style={{ 
              borderColor: colors.border,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.1)'
            }}
            onClick={stopPropagation}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Classic Header */}
            <div 
              className="p-4 border-b"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background
              }}
            >
              <div className="text-center">
                <h2 
                  className="text-xl font-serif font-bold mb-1"
                  style={{ color: colors.secondary }}
                >
                  {isUpdate ? t.updateTitle : t.title}
                </h2>
                <p 
                  className="text-xs"
                  style={{ color: colors.text }}
                >
                  {isUpdate ? t.updateDeadline : t.deadline}
                </p>
                
                {guestName && (
                  <div 
                    className="mt-3 p-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.accent,
                      backgroundColor: `${colors.accent}10`
                    }}
                  >
                    <p className="text-xs font-medium" style={{ color: colors.secondary }}>
                      {t.specialInvitation}
                    </p>
                    <p className="font-serif font-semibold mt-1 text-sm" style={{ color: colors.accent }}>
                      {guestName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isSubmitted ? (
              // Success State
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ 
                    backgroundColor: `${colors.success}20`,
                    border: `2px solid ${colors.success}`
                  }}
                >
                  <svg 
                    className="w-6 h-6"
                    style={{ color: colors.success }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                
                <h3 
                  className="text-lg font-serif font-bold mb-2"
                  style={{ color: colors.success }}
                >
                  {isUpdate ? t.updateSuccessTitle : t.successTitle}
                </h3>
                
                <p 
                  className="mb-3 text-sm"
                  style={{ color: colors.text }}
                >
                  {isUpdate ? t.updateSuccessMessage : t.successMessage}
                </p>
                
                <p 
                  className="text-xs italic"
                  style={{ color: colors.primary }}
                >
                  {t.excitement}
                </p>
              </div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  {/* Name Input - Only show if no guestName provided */}
                  {!guestName && (
                    <div>
                      <label 
                        className="block text-xs font-medium mb-1"
                        style={{ color: colors.secondary }}
                      >
                        {t.fullName}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200"
                        style={{ 
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text
                        }}
                        placeholder={t.namePlaceholder}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        onClick={stopPropagation}
                        onTouchStart={stopPropagation}
                      />
                    </div>
                  )}

                  {/* Attendance Selection */}
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: colors.secondary }}
                    >
                      {t.attendanceQuestion}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Yes Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          stopPropagation(e);
                          setAttending('yes');
                        }}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                          attending === 'yes' 
                            ? 'border-green-600 bg-green-50 text-green-700' 
                            : 'border-gray-300 bg-white hover:border-green-400 text-gray-700'
                        }`}
                      >
                        <div className="font-semibold text-sm">{t.yes}</div>
                        <div className="text-xs mt-1 opacity-75">{t.yesLabel}</div>
                      </button>

                      {/* No Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          stopPropagation(e);
                          setAttending('no');
                        }}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                          attending === 'no' 
                            ? 'border-amber-600 bg-amber-50 text-amber-700' 
                            : 'border-gray-300 bg-white hover:border-amber-400 text-gray-700'
                        }`}
                      >
                        <div className="font-semibold text-sm">{t.no}</div>
                        <div className="text-xs mt-1 opacity-75">{t.noLabel}</div>
                      </button>
                    </div>
                  </div>

                  {/* Number of Guests - Only show if attending is yes */}
                  {attending === 'yes' && (
                    <div>
                      <label 
                        className="block text-xs font-medium mb-1"
                        style={{ color: colors.secondary }}
                      >
                        {t.guestsCount}
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200"
                        style={{ 
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text
                        }}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        onClick={stopPropagation}
                      >
                        {guestOptions.map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? t.person : t.people}
                          </option>
                        ))}
                      </select>
                      <p 
                        className="text-xs mt-1 opacity-70"
                        style={{ color: colors.text }}
                      >
                        {t.guestsNote}
                      </p>
                    </div>
                  )}

                  {/* Children Information - Only show if attending is yes */}
                  {attending === 'yes' && (
                    <div className="pt-1">
                      <div 
                        className="p-2 rounded-lg border text-center"
                        style={{ 
                          borderColor: colors.accent,
                          backgroundColor: `${colors.accent}08`
                        }}
                      >
                        <p 
                          className="text-xs font-semibold mb-1"
                          style={{ color: colors.accent }}
                        >
                          {t.childrenInfo}
                        </p>
                        <p 
                          className="text-xs leading-tight"
                          style={{ color: colors.text }}
                        >
                          {t.childrenNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label 
                      className="block text-xs font-medium mb-1"
                      style={{ color: colors.secondary }}
                    >
                      {t.message}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) =>setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200 resize-none"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                      placeholder={t.messagePlaceholder}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      onClick={stopPropagation}
                      onMouseDown={stopPropagation}
                      onTouchStart={stopPropagation}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!(guestName || name.trim()) || !attending || isSubmitting}
                      className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: colors.primary,
                        color: 'white'
                      }}
                      onMouseOver={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colors.secondary;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colors.primary;
                        }
                      }}
                      onClick={stopPropagation}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                          />
                          {t.submitting}
                        </div>
                      ) : (
                        isUpdate ? t.update : t.submit
                      )}
                    </button>

                    {/* Later Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        stopPropagation(e);
                        handleClose();
                      }}
                      className="w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: 'transparent',
                        color: colors.text
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = colors.background;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {t.later}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}