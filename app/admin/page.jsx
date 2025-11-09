'use client';
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [rsvps, setRsvps] = useState([]);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRsvp, setSelectedRsvp] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    declined: 0,
    pending: 0,
    totalGuests: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'wedding2025';

  const loadRSVPs = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('🔄 Loading guests from API...');
      const response = await fetch('/api/guests');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Guests loaded:', data);
      setRsvps(data);
      
      // Calculate stats
      const total = data.length;
      const confirmed = data.filter(g => g.status === 'confirmed').length;
      const declined = data.filter(g => g.status === 'declined').length;
      const pending = data.filter(g => g.status === 'pending').length;
      const totalGuests = data
        .filter(g => g.status === 'confirmed')
        .reduce((sum, guest) => sum + (guest.attendance?.guestsCount || 1), 0);

      setStats({ total, confirmed, declined, pending, totalGuests });
      
    } catch (error) {
      console.error('❌ Error loading RSVPs:', error);
      setError(`فشل في تحميل البيانات: ${error.message}`);
    } finally {
      setIsLoading(false);
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
      loadRSVPs(); // Reload the list
      
      // Auto hide success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Error deleting guest:', error);
      setError('فشل في حذف الضيف');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    loadRSVPs();

    // Refresh every 30 seconds
    const interval = setInterval(loadRSVPs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  useEffect(() => {
    // Check if already authenticated
    if (localStorage.getItem('adminAuthenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const filteredRsvps = rsvps.filter(rsvp => {
    if (activeTab === 'all') return true;
    return rsvp.status === activeTab;
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setRsvps([]);
    setStats({ total: 0, confirmed: 0, declined: 0, pending: 0, totalGuests: 0 });
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">👑</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2 font-arabic">لوحة التحكم</h1>
            <p className="text-gray-600 text-sm font-arabic">أدخل كلمة المرور للوصول إلى البيانات</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-arabic transition-colors"
              required
              dir="rtl"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors font-arabic shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              الدخول إلى لوحة التحكم
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">👑</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1 font-arabic">لوحة متابعة دعوات الزفاف</h1>
                    <p className="text-gray-600 font-arabic">متابعة لحظية لردود الضيوف</p>
                  </div>
                </div>
                
                {/* Success/Error Messages */}
                {success && (
                  <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-xl">
                    <p className="text-green-700 text-sm font-arabic flex items-center gap-2">
                      <span>✅</span> {success}
                    </p>
                  </div>
                )}
                
                {error && (
                  <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-xl">
                    <p className="text-red-700 text-sm font-arabic flex items-center gap-2">
                      <span>❌</span> {error}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Link
                  href="/admin/guests"
                  className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>👥</span>
                  إدارة الضيوف
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>🚪</span>
                  خروج
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm opacity-90 font-arabic">إجمالي المدعوين</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold">{stats.confirmed}</div>
                <div className="text-sm opacity-90 font-arabic">مؤكدين الحضور</div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold">{stats.declined}</div>
                <div className="text-sm opacity-90 font-arabic">غير قادرين</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm opacity-90 font-arabic">بانتظار الرد</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold">{stats.totalGuests}</div>
                <div className="text-sm opacity-90 font-arabic">إجمالي الحضور</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 font-arabic ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 font-arabic ${
                activeTab === 'confirmed'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              مؤكدون ({stats.confirmed})
            </button>
            <button
              onClick={() => setActiveTab('declined')}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 font-arabic ${
                activeTab === 'declined'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              غير قادرين ({stats.declined})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 font-arabic ${
                activeTab === 'pending'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              بانتظار الرد ({stats.pending})
            </button>
          </div>
        </div>

        {/* RSVP List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm font-arabic">جاري تحميل البيانات...</p>
            </div>
          ) : filteredRsvps.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm font-arabic">لا توجد ردود حتى الآن.</p>
              <p className="text-xs mt-1 font-arabic">
                {rsvps.length === 0 
                  ? 'لم يتم إضافة أي ضيوف بعد. انتقل إلى "إدارة الضيوف" لإضافة ضيوف.'
                  : 'لا توجد ردود تطابق الفلتر المحدد.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRsvps.map((rsvp) => (
                <div 
                  key={rsvp.id || rsvp.guestNumber} 
                  className="p-5 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group"
                  onClick={() => setSelectedRsvp(rsvp)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg font-arabic">{rsvp.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-arabic">
                          #{rsvp.guestNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          rsvp.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : rsvp.status === 'declined'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}
                      >
                        {rsvp.status === 'confirmed' ? 'مؤكد' : rsvp.status === 'declined' ? 'غير قادر' : 'بانتظار الرد'}
                      </span>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(rsvp);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-all duration-200"
                        title="حذف الضيف"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-arabic">
                        👥 {rsvp.status === 'confirmed' ? (rsvp.attendance?.guestsCount || 1) : '0'} ضيوف
                      </span>
                    </div>
                    <div className="text-left text-xs text-gray-500">
                      {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </div>
                  </div>
                  
                  {rsvp.attendance?.message && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 line-clamp-2 font-arabic bg-gray-50 p-3 rounded-lg border border-gray-200">
                        "{rsvp.attendance.message}"
                      </p>
                    </div>
                  )}

                  {/* Invitation Link */}
                  <div className="mt-3">
                    <span className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 font-arabic">
                      رابط الدعوة: {typeof window !== 'undefined' ? `${window.location.origin}/${rsvp.guestNumber}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const csv = [
                ['الاسم', 'الحالة', 'عدد الضيوف', 'الرسالة', 'رقم الدعوة', 'تاريخ التسجيل'],
                ...rsvps.map(rsvp => [
                  rsvp.name,
                  rsvp.status === 'confirmed' ? 'مؤكد' : rsvp.status === 'declined' ? 'غير قادر' : 'بانتظار الرد',
                  rsvp.status === 'confirmed' ? (rsvp.attendance?.guestsCount || 1) : 0,
                  rsvp.attendance?.message || '',
                  rsvp.guestNumber,
                  rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleString('ar-EG') : 'غير محدد'
                ])
              ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'wedding-rsvps.csv';
              a.click();
            }}
            className="bg-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 font-arabic shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>📥</span>
            تصدير إلى Excel
          </button>

          <button
            onClick={loadRSVPs}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 font-arabic shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>🔄</span>
            {isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>

          <button
            onClick={handleLogout}
            className="bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-2 font-arabic shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>🚪</span>
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full" dir="rtl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-arabic">تأكيد الحذف</h3>
              </div>
              <p className="text-gray-600 text-sm font-arabic">
                هل أنت متأكد من رغبتك في حذف الضيف <strong>{deleteConfirm.name}</strong>؟
                <br />
                <span className="text-red-600">هذا الإجراء لا يمكن التراجع عنه.</span>
              </p>
            </div>
            
            <div className="p-6 flex gap-3">
              <button
                onClick={() => deleteGuest(deleteConfirm.guestNumber)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors font-arabic"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors font-arabic"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSVP Detail Modal */}
      {selectedRsvp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" dir="rtl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 font-arabic">تفاصيل الرد</h3>
                <button
                  onClick={() => setSelectedRsvp(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic mb-2 block">الاسم</label>
                <p className="text-gray-900 font-semibold text-lg font-arabic">{selectedRsvp.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic mb-2 block">رقم الدعوة</label>
                <p className="text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded-lg">{selectedRsvp.guestNumber}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic mb-2 block">الحالة</label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedRsvp.status === 'confirmed'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : selectedRsvp.status === 'declined'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}
                >
                  {selectedRsvp.status === 'confirmed' ? 'مؤكد الحضور' : selectedRsvp.status === 'declined' ? 'غير قادر على الحضور' : 'بانتظار الرد'}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic mb-2 block">عدد الضيوف</label>
                <p className="text-gray-900 font-arabic text-lg">
                  {selectedRsvp.status === 'confirmed' ? (selectedRsvp.attendance?.guestsCount || 1) : '0'}
                </p>
              </div>
              
              {selectedRsvp.attendance?.message && (
                <div>
                  <label className="text-sm font-medium text-gray-500 font-arabic mb-2 block">الرسالة</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-4 rounded-xl text-sm font-arabic border border-gray-200">
                    {selectedRsvp.attendance.message}
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic mb-2 block">تاريخ التسجيل</label>
                <p className="text-gray-900 text-sm font-arabic">
                  {selectedRsvp.createdAt ? new Date(selectedRsvp.createdAt).toLocaleDateString('ar-EG') + ' في ' + new Date(selectedRsvp.createdAt).toLocaleTimeString('ar-EG') : 'غير محدد'}
                </p>
              </div>

              {selectedRsvp.attendance?.submittedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500 font-arabic mb-2 block">تاريخ الرد</label>
                  <p className="text-gray-900 text-sm font-arabic">
                    {new Date(selectedRsvp.attendance.submittedAt).toLocaleDateString('ar-EG')} في{' '}
                    {new Date(selectedRsvp.attendance.submittedAt).toLocaleTimeString('ar-EG')}
                  </p>
                </div>
              )}

              {/* Invitation Link */}
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic mb-2 block">رابط الدعوة الشخصي</label>
                <p className="text-gray-900 text-sm bg-blue-50 p-3 rounded-lg break-all border border-blue-200">
                  {typeof window !== 'undefined' ? `${window.location.origin}/${selectedRsvp.guestNumber}` : ''}
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedRsvp(null)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors font-arabic shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}