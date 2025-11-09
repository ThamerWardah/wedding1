import { NextResponse } from 'next/server'

// Store for device registrations - key: guestNumber, value: Set of device fingerprints
const deviceRegistrations = new Map()

export async function POST(request) {
  try {
    const {
      fingerprint,
      userAgent,
      guestNumber = 'default',
    } = await request.json()

    // Initialize if first time for this guestNumber
    if (!deviceRegistrations.has(guestNumber)) {
      deviceRegistrations.set(guestNumber, new Set())
    }

    const devices = deviceRegistrations.get(guestNumber)

    // Check if device is already registered
    if (devices.has(fingerprint)) {
      return NextResponse.json({
        authorized: true,
        message: 'Device already authorized',
        deviceCount: devices.size,
        isRegistered: true,
      })
    }

    // Check if we can register new device (max 2 per guestNumber)
    if (devices.size < 2) {
      devices.add(fingerprint)
      return NextResponse.json({
        authorized: true,
        message: 'Device registered successfully',
        deviceCount: devices.size,
        isNewRegistration: true,
      })
    }

    // Max devices reached
    return NextResponse.json(
      {
        authorized: false,
        message: 'Maximum devices reached (2 devices allowed)',
        deviceCount: devices.size,
      },
      { status: 403 },
    )
  } catch (error) {
    console.error('Device registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// Get device count for a guestNumber
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const guestNumber = searchParams.get('guestNumber') || 'default'

  const devices = deviceRegistrations.get(guestNumber) || new Set()

  return NextResponse.json({
    deviceCount: devices.size,
    guestNumber: guestNumber,
  })
}
