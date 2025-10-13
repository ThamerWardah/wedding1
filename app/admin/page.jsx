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
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    declined: 0,
    pending: 0,
    totalGuests: 0
  });
  const [error, setError] = useState('');

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
      alert('كلمة المرور غير صحيحة');
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
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        console.log('✅ Firebase connection test passed:', settings);
        return true;
      } else {
        console.error('❌ Firebase connection test failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Firebase connection test error:', error);
      return false;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">👑</span>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-arabic"
              required
              dir="rtl"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors font-arabic"
            >
              الدخول إلى لوحة التحكم
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1 font-arabic">لوحة متابعة دعوات الزفاف</h1>
                <p className="text-gray-600 text-sm font-arabic">متابعة لحظية لردود الضيوف</p>
                <p className="text-xs text-green-600 mt-1 font-arabic">
                  ✅ بيانات مباشرة - جميع الردود محفوظة تلقائياً
                </p>
                
                {/* Error Display */}
                {error && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 text-sm font-arabic">{error}</p>
                    <button
                      onClick={testFirebaseConnection}
                      className="text-xs text-red-600 underline mt-1 font-arabic"
                    >
                      اختبار اتصال Firebase
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href="/admin/guests"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <span>👥</span>
                  إدارة الضيوف
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                >
                  <span>🚪</span>
                  خروج
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-600 font-arabic">إجمالي المدعوين</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                <div className="text-lg font-bold text-green-600">{stats.confirmed}</div>
                <div className="text-xs text-gray-600 font-arabic">مؤكدين الحضور</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                <div className="text-lg font-bold text-red-600">{stats.declined}</div>
                <div className="text-xs text-gray-600 font-arabic">غير قادرين</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-xs text-gray-600 font-arabic">بانتظار الرد</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                <div className="text-lg font-bold text-purple-600">{stats.totalGuests}</div>
                <div className="text-xs text-gray-600 font-arabic">إجمالي الحضور</div>
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-arabic">معلومات التصحيح:</span>
                <button
                  onClick={() => {
                    console.log('Current RSVPs:', rsvps);
                    console.log('Stats:', stats);
                    testFirebaseConnection();
                  }}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-arabic"
                >
                  عرض معلومات التصحيح
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 font-arabic">
                الضيوف المحملين: {rsvps.length} | اخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-4">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-colors font-arabic ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100'
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-colors font-arabic ${
                activeTab === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100'
              }`}
            >
              مؤكدون ({stats.confirmed})
            </button>
            <button
              onClick={() => setActiveTab('declined')}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-colors font-arabic ${
                activeTab === 'declined'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100'
              }`}
            >
              غير قادرين ({stats.declined})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-colors font-arabic ${
                activeTab === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100'
              }`}
            >
              بانتظار الرد ({stats.pending})
            </button>
          </div>
        </div>

        {/* RSVP List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm font-arabic">جاري تحميل البيانات...</p>
            </div>
          ) : filteredRsvps.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">📝</div>
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
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRsvp(rsvp)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base font-arabic">{rsvp.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 font-arabic">
                        رقم الدعوة: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{rsvp.guestNumber}</span>
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        rsvp.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : rsvp.status === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {rsvp.status === 'confirmed' ? 'مؤكد' : rsvp.status === 'declined' ? 'غير قادر' : 'بانتظار الرد'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-arabic">
                        👥 {rsvp.status === 'confirmed' ? (rsvp.attendance?.guestsCount || 1) : '0'} ضيوف
                      </span>
                    </div>
                    <div className="text-left text-xs text-gray-500">
                      {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </div>
                  </div>
                  
                  {rsvp.attendance?.message && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2 font-arabic">
                        "{rsvp.attendance.message}"
                      </p>
                    </div>
                  )}

                  {/* Invitation Link */}
                  <div className="mt-2">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded font-arabic">
                      رابط الدعوة: {typeof window !== 'undefined' ? `${window.location.origin}/${rsvp.guestNumber}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2">
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
            className="bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 font-arabic"
          >
            <span>📥</span>
            تصدير إلى Excel
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={loadRSVPs}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 font-arabic"
            >
              <span>🔄</span>
              {isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}
            </button>

            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-2 font-arabic"
            >
              <span>🚪</span>
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Debug Section */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="font-semibold text-yellow-800 text-sm mb-2 flex items-center gap-1 font-arabic">
            <span>🐛</span> معلومات التصحيح
          </h3>
          <div className="text-yellow-700 text-xs space-y-1 font-arabic">
            <div>الضيوف المحملين: {rsvps.length}</div>
            <div>اخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</div>
            <button
              onClick={() => {
                console.log('RSVPs Data:', rsvps);
                console.log('Stats:', stats);
                console.log('Filtered RSVPs:', filteredRsvps);
              }}
              className="text-yellow-600 underline text-xs"
            >
              عرض البيانات في الكونسول
            </button>
          </div>
        </div>
      </div>

      {/* RSVP Detail Modal */}
      {selectedRsvp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto" dir="rtl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 font-arabic">تفاصيل الرد</h3>
                <button
                  onClick={() => setSelectedRsvp(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic">الاسم</label>
                <p className="text-gray-900 font-semibold font-arabic">{selectedRsvp.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic">رقم الدعوة</label>
                <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{selectedRsvp.guestNumber}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic">الحالة</label>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    selectedRsvp.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : selectedRsvp.status === 'declined'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedRsvp.status === 'confirmed' ? 'مؤكد الحضور' : selectedRsvp.status === 'declined' ? 'غير قادر على الحضور' : 'بانتظار الرد'}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic">عدد الضيوف</label>
                <p className="text-gray-900 font-arabic">
                  {selectedRsvp.status === 'confirmed' ? (selectedRsvp.attendance?.guestsCount || 1) : '0'}
                </p>
              </div>
              
              {selectedRsvp.attendance?.message && (
                <div>
                  <label className="text-sm font-medium text-gray-500 font-arabic">الرسالة</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg text-sm font-arabic">
                    {selectedRsvp.attendance.message}
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic">تاريخ التسجيل</label>
                <p className="text-gray-900 text-sm font-arabic">
                  {selectedRsvp.createdAt ? new Date(selectedRsvp.createdAt).toLocaleDateString('ar-EG') + ' في ' + new Date(selectedRsvp.createdAt).toLocaleTimeString('ar-EG') : 'غير محدد'}
                </p>
              </div>

              {selectedRsvp.attendance?.submittedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500 font-arabic">تاريخ الرد</label>
                  <p className="text-gray-900 text-sm font-arabic">
                    {new Date(selectedRsvp.attendance.submittedAt).toLocaleDateString('ar-EG')} في{' '}
                    {new Date(selectedRsvp.attendance.submittedAt).toLocaleTimeString('ar-EG')}
                  </p>
                </div>
              )}

              {/* Invitation Link */}
              <div>
                <label className="text-sm font-medium text-gray-500 font-arabic">رابط الدعوة الشخصي</label>
                <p className="text-gray-900 text-sm bg-blue-50 p-2 rounded-lg break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/${selectedRsvp.guestNumber}` : ''}
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedRsvp(null)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors font-arabic"
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