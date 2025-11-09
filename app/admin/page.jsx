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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('تم نسخ الرابط بنجاح');
      setTimeout(() => setSuccess(''), 2000);
    }).catch(() => {
      setError('فشل في نسخ الرابط');
    });
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
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">👑</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-1 font-arabic">لوحة التحكم</h1>
            <p className="text-gray-600 text-xs font-arabic">أدخل كلمة المرور للوصول إلى البيانات</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-arabic transition-colors"
              required
              dir="rtl"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors font-arabic shadow-md text-sm"
            >
              الدخول إلى لوحة التحكم
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-3" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👑</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-800 font-arabic">لوحة متابعة الدعوات</h1>
                    <p className="text-gray-600 text-xs font-arabic">متابعة لحظية لردود الضيوف</p>
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
              
              <div className="flex flex-col gap-1">
                <Link
                  href="/admin/guests"
                  className="bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-xs flex items-center gap-1 shadow-md"
                >
                  <span>👥</span>
                  إدارة الضيوف
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-xs flex items-center gap-1 shadow-md"
                >
                  <span>🚪</span>
                  خروج
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-2 text-center shadow-md">
                <div className="text-base font-bold">{stats.total}</div>
                <div className="text-xs opacity-90 font-arabic">المدعوين</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-2 text-center shadow-md">
                <div className="text-base font-bold">{stats.confirmed}</div>
                <div className="text-xs opacity-90 font-arabic">مؤكدين</div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-2 text-center shadow-md">
                <div className="text-base font-bold">{stats.declined}</div>
                <div className="text-xs opacity-90 font-arabic">غير قادرين</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-2 text-center shadow-md">
                <div className="text-base font-bold">{stats.pending}</div>
                <div className="text-xs opacity-90 font-arabic">بانتظار الرد</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-2 text-center shadow-md col-span-2">
                <div className="text-base font-bold">{stats.totalGuests}</div>
                <div className="text-xs opacity-90 font-arabic">إجمالي الحضور</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-3 mb-4 border border-gray-100">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 font-arabic ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 font-arabic ${
                activeTab === 'confirmed'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              مؤكدون ({stats.confirmed})
            </button>
            <button
              onClick={() => setActiveTab('declined')}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 font-arabic ${
                activeTab === 'declined'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              غير قادرين ({stats.declined})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 font-arabic ${
                activeTab === 'pending'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              بانتظار الرد ({stats.pending})
            </button>
          </div>
        </div>

        {/* RSVP List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-xs font-arabic">جاري تحميل البيانات...</p>
            </div>
          ) : filteredRsvps.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-xs font-arabic">لا توجد ردود حتى الآن.</p>
              <p className="text-xs mt-1 font-arabic">
                {rsvps.length === 0 
                  ? 'لم يتم إضافة أي ضيوف بعد.'
                  : 'لا توجد ردود تطابق الفلتر المحدد.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRsvps.map((rsvp) => (
                <div 
                  key={rsvp.id || rsvp.guestNumber} 
                  className="p-3 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group"
                  onClick={() => setSelectedRsvp(rsvp)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm font-arabic">{rsvp.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full font-arabic">
                          #{rsvp.guestNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                        className="bg-red-100 text-red-600 p-1 rounded-md transition-all duration-200 text-xs"
                        title="حذف الضيف"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-arabic">
                        👥 {rsvp.status === 'confirmed' ? (rsvp.attendance?.guestsCount || 1) : '0'} ضيوف
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </div>
                  </div>
                  
                  {rsvp.attendance?.message && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 line-clamp-2 font-arabic bg-gray-50 p-2 rounded-lg border border-gray-200">
                        "{rsvp.attendance.message}"
                      </p>
                    </div>
                  )}

                  {/* Invitation Link with Copy Button */}
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-arabic truncate flex-1">
                      رابط الدعوة: {typeof window !== 'undefined' ? `${window.location.origin}/${rsvp.guestNumber}` : ''}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(`${window.location.origin}/${rsvp.guestNumber}`);
                      }}
                      className="bg-purple-100 text-purple-600 p-1 rounded-md text-xs hover:bg-purple-200 transition-colors"
                      title="نسخ الرابط"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-1 gap-2">
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-xs flex items-center justify-center gap-1 font-arabic shadow-md"
          >
            <span>📥</span>
            تصدير إلى Excel
          </button>

          <button
            onClick={loadRSVPs}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs flex items-center justify-center gap-1 font-arabic shadow-md"
          >
            <span>🔄</span>
            {isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
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
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors font-arabic text-xs"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors font-arabic text-xs"
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
          <div className="bg-white rounded-xl max-w-xs w-full max-h-[80vh] overflow-y-auto" dir="rtl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900 font-arabic">تفاصيل الرد</h3>
                <button
                  onClick={() => setSelectedRsvp(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 font-arabic mb-1 block">الاسم</label>
                <p className="text-gray-900 font-semibold text-sm font-arabic">{selectedRsvp.name}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 font-arabic mb-1 block">رقم الدعوة</label>
                <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-xs">{selectedRsvp.guestNumber}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 font-arabic mb-1 block">الحالة</label>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                <label className="text-xs font-medium text-gray-500 font-arabic mb-1 block">عدد الضيوف</label>
                <p className="text-gray-900 font-arabic text-sm">
                  {selectedRsvp.status === 'confirmed' ? (selectedRsvp.attendance?.guestsCount || 1) : '0'}
                </p>
              </div>
              
              {selectedRsvp.attendance?.message && (
                <div>
                  <label className="text-xs font-medium text-gray-500 font-arabic mb-1 block">الرسالة</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg text-xs font-arabic border border-gray-200">
                    {selectedRsvp.attendance.message}
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-xs font-medium text-gray-500 font-arabic mb-1 block">تاريخ التسجيل</label>
                <p className="text-gray-900 text-xs font-arabic">
                  {selectedRsvp.createdAt ? new Date(selectedRsvp.createdAt).toLocaleDateString('ar-EG') + ' في ' + new Date(selectedRsvp.createdAt).toLocaleTimeString('ar-EG') : 'غير محدد'}
                </p>
              </div>

              {selectedRsvp.attendance?.submittedAt && (
                <div>
                  <label className="text-xs font-medium text-gray-500 font-arabic mb-1 block">تاريخ الرد</label>
                  <p className="text-gray-900 text-xs font-arabic">
                    {new Date(selectedRsvp.attendance.submittedAt).toLocaleDateString('ar-EG')} في{' '}
                    {new Date(selectedRsvp.attendance.submittedAt).toLocaleTimeString('ar-EG')}
                  </p>
                </div>
              )}

              {/* Invitation Link with Copy */}
              <div>
                <label className="text-xs font-medium text-gray-500 font-arabic mb-1 block">رابط الدعوة الشخصي</label>
                <div className="flex gap-1">
                  <p className="text-gray-900 text-xs bg-blue-50 p-2 rounded flex-1 break-all border border-blue-200">
                    {typeof window !== 'undefined' ? `${window.location.origin}/${selectedRsvp.guestNumber}` : ''}
                  </p>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/${selectedRsvp.guestNumber}`)}
                    className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 transition-colors text-xs"
                    title="نسخ الرابط"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedRsvp(null)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors font-arabic text-xs shadow-md"
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