import {
  addDoc,
  collection,
  deleteDoc,
  doc, // ADD THIS IMPORT
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export class FirebaseGuest {
  static async create(guestData) {
    try {
      if (!db) throw new Error('Firestore not initialized')

      const guestNumber = await this.generateGuestNumber()

      const guest = {
        guestNumber,
        name: guestData.name,
        phone: guestData.phone || '',
        email: guestData.email || '',
        group: guestData.group || 'General',
        status: 'pending',
        attendance: null,
        createdBy: guestData.createdBy || 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, 'guests'), guest)
      console.log('✅ Guest created:', guestNumber)
      return { id: docRef.id, ...guest }
    } catch (error) {
      console.error('❌ Error creating guest:', error)
      throw new Error(`Failed to create guest: ${error.message}`)
    }
  }

  static async findByNumber(guestNumber) {
    try {
      if (!db) throw new Error('Firestore not initialized')

      const q = query(
        collection(db, 'guests'),
        where('guestNumber', '==', guestNumber),
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        console.log('ℹ️ Guest not found:', guestNumber)
        return null
      }

      const docData = querySnapshot.docs[0]
      return { id: docData.id, ...docData.data() }
    } catch (error) {
      console.error('❌ Error finding guest:', error)
      throw new Error(`Failed to find guest: ${error.message}`)
    }
  }

  static async updateRSVP(guestNumber, rsvpData) {
    try {
      if (!db) throw new Error('Firestore not initialized')

      const guest = await this.findByNumber(guestNumber)
      if (!guest) throw new Error('Guest not found')

      const guestRef = doc(db, 'guests', guest.id)
      const updateData = {
        status: rsvpData.attending ? 'confirmed' : 'declined',
        attendance: {
          attending: rsvpData.attending,
          guestsCount: rsvpData.guestsCount || 0,
          message: rsvpData.message || '',
          submittedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      }

      await updateDoc(guestRef, updateData)
      console.log('✅ RSVP updated for:', guestNumber)
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating RSVP:', error)
      throw new Error(`Failed to update RSVP: ${error.message}`)
    }
  }

  static async findAll() {
    try {
      if (!db) throw new Error('Firestore not initialized')

      const q = query(collection(db, 'guests'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      const guests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log('✅ Found', guests.length, 'guests')
      return guests
    } catch (error) {
      console.error('❌ Error finding all guests:', error)
      throw new Error(`Failed to fetch guests: ${error.message}`)
    }
  }

  static async generateGuestNumber() {
    try {
      if (!db) {
        return String(Date.now()).slice(-6)
      }

      const q = query(
        collection(db, 'guests'),
        orderBy('guestNumber', 'desc'),
        limit(1),
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return '1001'

      const lastGuest = querySnapshot.docs[0].data()
      return String(parseInt(lastGuest.guestNumber) + 1)
    } catch (error) {
      console.error('❌ Error generating guest number:', error)
      return String(Date.now()).slice(-6)
    }
  }

  static async getStats() {
    try {
      const guests = await this.findAll()
      const total = guests.length
      const confirmed = guests.filter((g) => g.status === 'confirmed').length
      const declined = guests.filter((g) => g.status === 'declined').length
      const pending = guests.filter((g) => g.status === 'pending').length

      const totalGuests = guests
        .filter((g) => g.status === 'confirmed')
        .reduce((sum, guest) => sum + (guest.attendance?.guestsCount || 1), 0)

      return { total, confirmed, declined, pending, totalGuests }
    } catch (error) {
      console.error('❌ Error getting stats:', error)
      return { total: 0, confirmed: 0, declined: 0, pending: 0, totalGuests: 0 }
    }
  }

  // ADD THIS NEW METHOD - Enables guest deletion
  static async deleteByNumber(guestNumber) {
    try {
      if (!db) throw new Error('Firestore not initialized')

      // Find the guest by number
      const guest = await this.findByNumber(guestNumber)
      if (!guest) {
        console.log('ℹ️ Guest not found for deletion:', guestNumber)
        return null
      }

      // Delete the guest document using the document ID
      const guestRef = doc(db, 'guests', guest.id)
      await deleteDoc(guestRef)

      // Also delete any device registrations for this guest
      try {
        const deviceDocRef = doc(db, 'deviceRegistrations', guestNumber)
        const deviceDoc = await getDoc(deviceDocRef)

        if (deviceDoc.exists()) {
          await deleteDoc(deviceDocRef)
          console.log('✅ Device registrations deleted for:', guestNumber)
        }
      } catch (deviceError) {
        console.log('ℹ️ No device registrations found for guest:', guestNumber)
        // Continue even if device deletion fails
      }

      console.log('✅ Guest deleted successfully:', guestNumber)
      return {
        success: true,
        guestNumber,
        deletedGuest: guest.name,
      }
    } catch (error) {
      console.error('❌ Error deleting guest:', error)
      throw new Error(`Failed to delete guest: ${error.message}`)
    }
  }
}
