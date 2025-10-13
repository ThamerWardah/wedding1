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
    try {
      const response = await fetch('/api/guests');
      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!newGuest.name.trim()) return;

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
        alert(`تم إضافة الضيف بنجاح! رقم الدعوة: ${result.guestNumber}`);
        setNewGuest({ name: '', phone: '', email: '', group: 'General' });
        setShowAddForm(false);
        loadGuests();
      } else {
        alert('حدث خطأ أثناء إضافة الضيف');
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      alert('حدث خطأ أثناء إضافة الضيف');
    }
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    if (!bulkGuests.trim()) return;

    const guestNames = bulkGuests.split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (guestNames.length === 0) return;

    try {
      let successCount = 0;
      let errorCount = 0;

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
          }
        } catch (error) {
          errorCount++;
        }
      }

      alert(`تمت إضافة ${successCount} ضيف بنجاح. ${errorCount > 0 ? `فشل إضافة ${errorCount} ضيف` : ''}`);
      setBulkGuests('');
      setShowBulkForm(false);
      loadGuests();
    } catch (error) {
      console.error('Error in bulk add:', error);
      alert('حدث خطأ أثناء الإضافة الجماعية');
    }
  };

  const copyInvitationLink = (guestNumber) => {
    const link = `${window.location.origin}/${guestNumber}`;
    navigator.clipboard.writeText(link);
    alert('تم نسخ رابط الدعوة: ' + link);
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
      alert('تم نسخ رسالة الدعوة إلى الحافظة. يمكنك إرسالها للضيف عبر أي وسيلة اتصال.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1 font-arabic">إدارة الضيوف</h1>
              <p className="text-gray-600 text-sm font-arabic">إضافة وإدارة قائمة المدعوين</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/admin')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
              >
                <span>📊</span>
                لوحة الإحصائيات
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <span>➕</span>
              إضافة ضيف
            </button>
            <button
              onClick={() => setShowBulkForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
            >
              <span>👥</span>
              إضافة جماعية
            </button>
            <button
              onClick={loadGuests}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <span>🔄</span>
              تحديث القائمة
            </button>
          </div>
        </div>

        {/* Add Guest Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 font-arabic">إضافة ضيف جديد</h3>
            <form onSubmit={handleAddGuest} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+966500000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">المجموعة</label>
                  <select
                    value={newGuest.group}
                    onChange={(e) => setNewGuest({...newGuest, group: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  إضافة الضيف
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Add Form */}
        {showBulkForm && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 font-arabic">إضافة ضيوف بشكل جماعي</h3>
            <form onSubmit={handleBulkAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">
                  أسماء الضيوف (اسم كل ضيف في سطر مستقل)
                </label>
                <textarea
                  value={bulkGuests}
                  onChange={(e) => setBulkGuests(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  إضافة الضيوف
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Guests List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm font-arabic">جاري تحميل قائمة الضيوف...</p>
            </div>
          ) : guests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm font-arabic">لا توجد ضيوف مضافة حتى الآن.</p>
              <p className="text-xs mt-1 font-arabic">استخدم أزرار الإضافة أعلاه لإضافة ضيوف.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {guests.map((guest) => (
                <div key={guest.guestNumber} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base font-arabic">{guest.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-arabic">
                          رقم: {guest.guestNumber}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-arabic">
                          {guest.group}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-arabic ${
                          guest.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : guest.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {guest.status === 'confirmed' ? 'مؤكد' : guest.status === 'declined' ? 'غير قادر' : 'بانتظار الرد'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => copyInvitationLink(guest.guestNumber)}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                    >
                      <span>📋</span>
                      نسخ الرابط
                    </button>
                    <button
                      onClick={() => sendInvitation(guest)}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <span>📤</span>
                      إرسال الدعوة
                    </button>
                    {guest.phone && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        📞 {guest.phone}
                      </span>
                    )}
                    {guest.email && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        ✉️ {guest.email}
                      </span>
                    )}
                  </div>

                  {guest.attendance && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-arabic">
                        <strong>الرد:</strong> {guest.attendance.guestsCount} ضيوف | 
                        {guest.attendance.message && ` الرسالة: "${guest.attendance.message}"`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}