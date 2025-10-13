import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export class FirebaseSettings {
  static async getWeddingSettings() {
    try {
      if (!db) {
        console.warn('Firestore not available, using default settings')
        return this.getDefaultSettings()
      }

      const docRef = doc(db, 'settings', 'wedding')
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        console.log('✅ Settings loaded from Firebase')
        return docSnap.data()
      } else {
        console.log('ℹ️ Creating default settings in Firebase')
        const defaultSettings = this.getDefaultSettings()
        await setDoc(docRef, defaultSettings)
        return defaultSettings
      }
    } catch (error) {
      console.error('❌ Error getting settings:', error)
      console.log('⚠️ Using default settings due to error')
      return this.getDefaultSettings()
    }
  }

  static async updateSettings(newSettings) {
    try {
      if (!db) throw new Error('Firestore not initialized')

      const docRef = doc(db, 'settings', 'wedding')
      await setDoc(
        docRef,
        {
          ...newSettings,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )

      console.log('✅ Settings updated successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating settings:', error)
      throw new Error(`Failed to update settings: ${error.message}`)
    }
  }

  static getDefaultSettings() {
    return {
      coupleNames: {
        groom: 'العريس',
        bride: 'العروس',
      },
      weddingDate: new Date('2025-10-12').toISOString(),
      venue: 'البصرة - قاعة ألف ليلة وليلة',
      theme: 'romantic',
      rsvpDeadline: new Date('2025-09-30').toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}
