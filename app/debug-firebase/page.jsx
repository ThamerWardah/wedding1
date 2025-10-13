'use client'
import { useEffect, useState } from 'react'

export default function DebugFirebase() {
  const [status, setStatus] = useState('Testing Firebase Connection...')
  const [logs, setLogs] = useState([])
  const [testGuestNumber, setTestGuestNumber] = useState('')

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  useEffect(() => {
    testFirebaseConnection()
  }, [])

  const testFirebaseConnection = async () => {
    setLogs([])
    addLog('Starting Firebase connection test...', 'info')
    
    try {
      // Test 1: Check environment variables
      addLog('Checking environment variables...', 'info')
      const envVars = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
      }
      addLog(`Environment Variables: ${JSON.stringify(envVars)}`, 'info')

      // Test 2: Test settings API
      addLog('Testing settings API...', 'info')
      const settingsResponse = await fetch('/api/settings')
      const settingsData = await settingsResponse.json()
      
      if (settingsResponse.ok) {
        addLog('✅ Settings API working', 'success')
        addLog(`Settings: ${JSON.stringify(settingsData)}`, 'info')
      } else {
        addLog(`❌ Settings API failed: ${settingsData.error}`, 'error')
      }

      // Test 3: Test guests API (read)
      addLog('Testing guests API (read)...', 'info')
      const guestsResponse = await fetch('/api/guests')
      const guestsData = await guestsResponse.json()
      
      if (guestsResponse.ok) {
        addLog(`✅ Guests API working - Found ${guestsData.length} guests`, 'success')
      } else {
        addLog(`❌ Guests API failed: ${guestsData.error}`, 'error')
      }

      // Test 4: Test creating a guest
      addLog('Testing guest creation...', 'info')
      const testGuest = {
        name: 'Test Guest - ' + Date.now(),
        phone: '+1234567890',
        email: 'test@example.com',
        group: 'Test'
      }

      const createResponse = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testGuest)
      })
      
      const createData = await createResponse.json()
      
      if (createResponse.ok) {
        addLog(`✅ Guest creation successful! Guest Number: ${createData.guestNumber}`, 'success')
        setTestGuestNumber(createData.guestNumber)
        
        // Test 5: Verify the guest was saved by reading again
        addLog('Verifying guest was saved...', 'info')
        const verifyResponse = await fetch('/api/guests')
        const verifyData = await verifyResponse.json()
        
        if (verifyResponse.ok) {
          const foundGuest = verifyData.find(g => g.guestNumber === createData.guestNumber)
          if (foundGuest) {
            addLog('✅ Guest successfully saved and retrieved from Firebase!', 'success')
          } else {
            addLog('❌ Guest was created but not found in subsequent read', 'error')
          }
        }
      } else {
        addLog(`❌ Guest creation failed: ${createData.error}`, 'error')
      }

      setStatus('Test completed - Check logs below')

    } catch (error) {
      addLog(`❌ Test failed with error: ${error.message}`, 'error')
      setStatus('Test failed - Check logs below')
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Firebase Debug Dashboard</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2">Status: {status}</h2>
          {testGuestNumber && (
            <p className="text-green-600">
              ✅ Test Guest Number: {testGuestNumber} - Check Firebase Console to see if data appears
            </p>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={testFirebaseConnection}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Tests Again
          </button>
          <button
            onClick={clearLogs}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Logs
          </button>
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Open Firebase Console
          </a>
        </div>

        <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
          <div className="mb-2 text-gray-400">Console Output:</div>
          <div className="h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Run tests to see output.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-white'}`}>
                  [{log.timestamp}] {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold mb-2">Common Issues & Solutions:</h3>
            <ul className="text-sm space-y-1 text-yellow-800">
              <li>• Check Firestore Rules allow read/write</li>
              <li>• Verify Firebase project matches your config</li>
              <li>• Ensure Firestore API is enabled</li>
              <li>• Check browser console for network errors</li>
              <li>• Restart Next.js dev server after config changes</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ol className="text-sm space-y-1 text-blue-800 list-decimal list-inside">
              <li>Run the tests above</li>
              <li>Check Firebase Console for data</li>
              <li>If tests fail, check the error messages</li>
              <li>Update Firestore rules if needed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}