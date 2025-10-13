import { initializeApp } from 'firebase/app'
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

console.log('🔄 Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
})

// Initialize Firebase
let app
let db

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)

  console.log('✅ Firebase initialized successfully')
  console.log('🔗 Firestore database:', db)

  // Enable offline persistence (optional)
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db)
      .then(() => console.log('✅ Offline persistence enabled'))
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.log(
            'ℹ️ Multiple tabs open, persistence can only be enabled in one tab at a time.',
          )
        } else if (err.code === 'unimplemented') {
          console.log("ℹ️ The current browser doesn't support persistence.")
        }
      })
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error)
  console.error('Error details:', {
    code: error.code,
    message: error.message,
  })
}

export { db }
export default app
