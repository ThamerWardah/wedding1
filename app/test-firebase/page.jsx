'use client'
import { useEffect, useState } from 'react'

export default function TestFirebase() {
  const [status, setStatus] = useState('Testing...')
  const [data, setData] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test settings
        const settingsResponse = await fetch('/api/settings')
        const settings = await settingsResponse.json()
        
        // Test guests
        const guestsResponse = await fetch('/api/guests')
        const guests = await guestsResponse.json()
        
        setData({ settings, guests: guests.length })
        setStatus('✅ Firebase Connected Successfully!')
      } catch (error) {
        setStatus('❌ Firebase Connection Failed')
        console.error('Test failed:', error)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
        <div className={`p-4 rounded-lg mb-4 ${
          status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </div>
        
        {data && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold">Settings:</h3>
              <pre className="text-sm">{JSON.stringify(data.settings, null, 2)}</pre>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold">Guests in Database:</h3>
              <p>{data.guests} guests found</p>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Go to /admin and add some guests</li>
            <li>Check if they appear in Firebase console</li>
            <li>Test personalized invitation links</li>
            <li>Verify RSVP submissions are saved</li>
          </ol>
        </div>
      </div>
    </div>
  )
}