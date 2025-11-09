'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    phone: '',
    email: '',
    group: 'General'
  });
  const [bulkGuests, setBulkGuests] = useState('');
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingNumbers, setExistingNumbers] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
      router.push('/admin');
      return;
    }
    
    loadGuests();
  }, [router]);

  const loadGuests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/guests');
      if (response.ok) {
        const data = await response.json();
        setGuests(data);
        setExistingNumbers(new Set(data.map(g => g.guestNumber)));
      } else {
        throw new Error('Failed to load guests');
      }
    } catch (error) {
      console.error('Error loading guests:', error);
      setError('فشل في تحميل قائمة الضيوف');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newGuest.name.trim()) {
      setError('الرجاء إدخال اسم الضيف');
      return;
    }

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGuest),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`تم إضافة الضيف "${newGuest.name}" بنجاح! رقم الدعوة: ${result.guestNumber}`);
        setNewGuest({ name: '', phone: '', email: '', group: 'General' });
        setShowAddForm(false);
        loadGuests();
        
        // Auto hide success message
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add guest');
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      setError(error.message || 'حدث خطأ أثناء إضافة الضيف');
    }
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bulkGuests.trim()) {
      setError('الرجاء إدخال أسماء الضيوف');
      return;
    }

    const guestNames = bulkGuests.split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (guestNames.length === 0) {
      setError('لم يتم العثور على أسماء صحيحة');
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const name of guestNames) {
        try {
          const response = await fetch('/api/guests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, group: 'General' }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            errors.push(name);
          }
        } catch (error) {
          errorCount++;
          errors.push(name);
        }
      }

      if (errorCount === 0) {
        setSuccess(`تمت إضافة ${successCount} ضيف بنجاح`);
      } else {
        setSuccess(`تمت إضافة ${successCount} ضيف بنجاح. فشل إضافة ${errorCount} ضيف`);
        if (errors.length > 0) {
          setError(`الأسماء التي فشلت: ${errors.join(', ')}`);
        }
      }
      
      setBulkGuests('');
      setShowBulkForm(false);
      loadGuests();
      
      // Auto hide success message
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error in bulk add:', error);
      setError('حدث خطأ أثناء الإضافة الجماعية');
    }
  };

  const deleteGuest = async (guestNumber) => {
    try {
      setError('');
      const response = await fetch(`/api/guests/${guestNumber}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      setSuccess('تم حذف الضيف بنجاح');
      setDeleteConfirm(null);
      loadGuests();
      
      // Auto hide success message
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error deleting guest:', error);
      setError('فشل في حذف الضيف');
    }
  };

  const copyInvitationLink = (guestNumber) => {
    const link = `${window.location.origin}/${guestNumber}`;
    navigator.clipboard.writeText(link);
    setSuccess('تم نسخ رابط الدعوة إلى الحافظة');
    setTimeout(() => setSuccess(''), 3000);
  };

  const sendInvitation = (guest) => {
    const link = `${window.location.origin}/${guest.guestNumber}`;
    const message = `مرحباً ${guest.name}،

أنت مدعو لحضور حفل زفافنا!

يمكنك مشاهدة الدعوة والرد عليها من خلال الرابط التالي:
${link}

نتمنى مشاركتك فرحتنا 💐`;

    if (guest.phone) {
      // For WhatsApp
      const whatsappUrl = `https://wa.me/${guest.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(message);
      setSuccess('تم نسخ رسالة الدعوة إلى الحافظة. يمكنك إرسالها للضيف عبر أي وسيلة اتصال.');
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const isDuplicate = existingNumbers.has(newGuest.guestNumber);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-3" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800 font-arabic">إدارة الضيوف</h1>
                  <p className="text-gray-600 text-xs font-arabic">إضافة وإدارة قائمة المدعوين</p>
                </div>
              </div>
              
              {/* Success/Error Messages */}
              {success && (
                <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-700 text-xs font-arabic flex items-center gap-1">
                    <span>✅</span> {success}
                  </p>
                </div>
              )}
              
              {error && (
                <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-xs font-arabic flex items-center gap-1">
                    <span>❌</span> {error}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex">
              <button
                onClick={() => router.push('/admin')}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs flex items-center gap-1 shadow-md"
              >
                <span>📊</span>
                لوحة الإحصائيات
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-xs flex items-center gap-1 shadow-md"
            >
              <span>➕</span>
              إضافة ضيف
            </button>
            <button
              onClick={() => setShowBulkForm(true)}
              className="bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-xs flex items-center gap-1 shadow-md"
            >
              <span>👥</span>
              إضافة جماعية
            </button>
            <button
              onClick={loadGuests}
              disabled={isLoading}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs flex items-center gap-1 shadow-md disabled:opacity-50"
            >
              <span>🔄</span>
              {isLoading ? 'جاري التحديث...' : 'تحديث القائمة'}
            </button>
          </div>
        </div>

        {/* Add Guest Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-800 font-arabic">إضافة ضيف جديد</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddGuest} className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 font-arabic">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-arabic"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 font-arabic">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-arabic"
                    placeholder="+966500000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 font-arabic">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-arabic"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 font-arabic">المجموعة</label>
                  <select
                    value={newGuest.group}
                    onChange={(e) => setNewGuest({...newGuest, group: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-arabic"
                  >
                    <option value="General">عام</option>
                    <option value="Family">العائلة</option>
                    <option value="Friends">الأصدقاء</option>
                    <option value="Work">زملاء العمل</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-1 text-xs shadow-md"
                >
                  <span>➕</span>
                  إضافة الضيف
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-1 text-xs shadow-md"
                >
                  <span>✕</span>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Add Form */}
        {showBulkForm && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-800 font-arabic">إضافة ضيوف بشكل جماعي</h3>
              <button
                onClick={() => setShowBulkForm(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleBulkAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 font-arabic">
                  أسماء الضيوف (اسم كل ضيف في سطر مستقل)
                </label>
                <textarea
                  value={bulkGuests}
                  onChange={(e) => setBulkGuests(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors font-arabic"
                  placeholder="أحمد محمد
فاطمة عبدالله
خالد إبراهيم"
                />
                <p className="text-xs text-gray-500 mt-1 font-arabic">
                  أدخل اسم كل ضيف في سطر مستقل. سيتم إنشاء رقم دعوة تلقائي لكل ضيف.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs shadow-md"
                >
                  <span>👥</span>
                  إضافة الضيوف
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-1 text-xs shadow-md"
                >
                  <span>✕</span>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Guests List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-base font-bold text-gray-800 font-arabic">الضيوف المضافين ({guests.length})</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-xs font-arabic">جاري تحميل قائمة الضيوف...</p>
            </div>
          ) : guests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-xs font-arabic">لا توجد ضيوف مضافة حتى الآن.</p>
              <p className="text-xs mt-1 font-arabic">استخدم أزرار الإضافة أعلاه لإضافة ضيوف.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {guests.map((guest) => (
                <div key={guest.guestNumber} className="p-3 hover:bg-blue-50/30 transition-all duration-200 group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm font-arabic">{guest.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full font-arabic">
                          #{guest.guestNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full font-arabic">
                          {guest.group}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-arabic ${
                          guest.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : guest.status === 'declined'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {guest.status === 'confirmed' ? 'مؤكد' : guest.status === 'declined' ? 'غير قادر' : 'بانتظار الرد'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(guest);
                        }}
                        className="bg-red-100 text-red-600 p-1 rounded-md transition-all duration-200 text-xs"
                        title="حذف الضيف"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  {(guest.phone || guest.email) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {guest.phone && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>📞</span>
                          {guest.phone}
                        </span>
                      )}
                      {guest.email && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>✉️</span>
                          {guest.email}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => copyInvitationLink(guest.guestNumber)}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 shadow-md"
                    >
                      <span>📋</span>
                      نسخ الرابط
                    </button>
                    <button
                      onClick={() => sendInvitation(guest)}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 shadow-md"
                    >
                      <span>📤</span>
                      إرسال الدعوة
                    </button>
                  </div>

                  {/* Attendance Info */}
                  {guest.attendance && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-700 font-arabic">
                        <strong>الرد:</strong> {guest.attendance.guestsCount} ضيوف
                        {guest.attendance.message && ` | الرسالة: "${guest.attendance.message}"`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-xs w-full" dir="rtl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">⚠️</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 font-arabic">تأكيد الحذف</h3>
              </div>
              <p className="text-gray-600 text-xs font-arabic">
                هل أنت متأكد من رغبتك في حذف الضيف <strong>{deleteConfirm.name}</strong>؟
                <br />
                <span className="text-red-600">هذا الإجراء لا يمكن التراجع عنه.</span>
              </p>
            </div>
            
            <div className="p-4 flex gap-2">
              <button
                onClick={() => deleteGuest(deleteConfirm.guestNumber)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors font-arabic text-xs shadow-md"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors font-arabic text-xs shadow-md"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}