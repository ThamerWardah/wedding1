// lib/deviceService.js
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

const DEVICES_COLLECTION = 'deviceRegistrations'

export async function registerDevice(guestNumber, fingerprint, userAgent) {
  try {
    const deviceDocRef = doc(db, DEVICES_COLLECTION, guestNumber)
    const deviceDoc = await getDoc(deviceDocRef)

    const currentTime = new Date().toISOString()

    if (!deviceDoc.exists()) {
      // First device for this guestNumber
      await setDoc(deviceDocRef, {
        guestNumber,
        devices: [
          {
            fingerprint,
            userAgent,
            registeredAt: currentTime,
            lastSeen: currentTime,
          },
        ],
        totalDevices: 1,
        createdAt: currentTime,
        updatedAt: currentTime,
      })

      return {
        authorized: true,
        deviceCount: 1,
        isNewRegistration: true,
        message: 'First device registered successfully',
      }
    }

    const data = deviceDoc.data()
    const existingDevice = data.devices.find(
      (device) => device.fingerprint === fingerprint,
    )

    if (existingDevice) {
      // Device already registered - update last seen
      const updatedDevices = data.devices.map((device) =>
        device.fingerprint === fingerprint
          ? { ...device, lastSeen: currentTime }
          : device,
      )

      await updateDoc(deviceDocRef, {
        devices: updatedDevices,
        updatedAt: currentTime,
      })

      return {
        authorized: true,
        deviceCount: data.totalDevices,
        isRegistered: true,
        message: 'Device already authorized',
      }
    }

    // Check if we can register new device
    if (data.totalDevices < 2) {
      const newDevice = {
        fingerprint,
        userAgent,
        registeredAt: currentTime,
        lastSeen: currentTime,
      }

      await updateDoc(deviceDocRef, {
        devices: arrayUnion(newDevice),
        totalDevices: data.totalDevices + 1,
        updatedAt: currentTime,
      })

      return {
        authorized: true,
        deviceCount: data.totalDevices + 1,
        isNewRegistration: true,
        message: 'Device registered successfully',
      }
    }

    // Max devices reached
    return {
      authorized: false,
      deviceCount: data.totalDevices,
      message: 'Maximum devices reached (2 devices allowed)',
    }
  } catch (error) {
    console.error('Firebase device registration error:', error)
    throw error
  }
}

export async function getDeviceCount(guestNumber) {
  try {
    const deviceDocRef = doc(db, DEVICES_COLLECTION, guestNumber)
    const deviceDoc = await getDoc(deviceDocRef)

    if (!deviceDoc.exists()) {
      return { deviceCount: 0 }
    }

    const data = deviceDoc.data()
    return { deviceCount: data.totalDevices || 0 }
  } catch (error) {
    console.error('Firebase get device count error:', error)
    throw error
  }
}
