// app/api/device/register/route.js
import { getDeviceCount, registerDevice } from '@/lib/deviceService'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const {
      fingerprint,
      userAgent,
      guestNumber = 'default',
    } = await request.json()

    if (!fingerprint) {
      return NextResponse.json(
        { error: 'Device fingerprint is required' },
        { status: 400 },
      )
    }

    const result = await registerDevice(guestNumber, fingerprint, userAgent)

    if (result.authorized) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 403 })
    }
  } catch (error) {
    console.error('Device registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const guestNumber = searchParams.get('guestNumber') || 'default'

    const result = await getDeviceCount(guestNumber)

    return NextResponse.json({
      deviceCount: result.deviceCount,
      guestNumber: guestNumber,
    })
  } catch (error) {
    console.error('Device count API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
