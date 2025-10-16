import { NextResponse } from 'next/server'
import { FirebaseGuest } from '../../../models/FirebaseGuest'

export async function GET() {
  try {
    const stats = await FirebaseGuest.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch RSVP stats: ' + error.message },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    console.log(JSON.stringify(body))
    const { guestNumber, ...rsvpData } = body

    if (!guestNumber) {
      return NextResponse.json(
        { error: 'Guest number is required' },
        { status: 400 },
      )
    }

    const result = await FirebaseGuest.updateRSVP(guestNumber, rsvpData)

    return NextResponse.json({
      success: true,
      message: 'RSVP submitted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit RSVP: ' + error.message },
      { status: 500 },
    )
  }
}
