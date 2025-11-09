import { NextResponse } from 'next/server'
import { FirebaseGuest } from '../../../../models/FirebaseGuest'

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 14
    const { guestNumber } = await params

    const guest = await FirebaseGuest.findByNumber(guestNumber)

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guest: ' + error.message },
      { status: 500 },
    )
  }
}

export async function PUT(request, { params }) {
  try {
    // Await params in Next.js 14
    const { guestNumber } = await params
    const body = await request.json()

    const result = await FirebaseGuest.updateRSVP(guestNumber, body)

    return NextResponse.json({
      success: true,
      message: 'RSVP updated successfully',
    })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json(
      { error: 'Failed to update RSVP: ' + error.message },
      { status: 500 },
    )
  }
}

// ADD THIS NEW METHOD - Handles guest deletion requests
export async function DELETE(request, { params }) {
  try {
    // Await params in Next.js 14
    const { guestNumber } = await params

    if (!guestNumber) {
      return NextResponse.json(
        { error: 'Guest number is required' },
        { status: 400 },
      )
    }

    // Call the delete method from your FirebaseGuest model
    const result = await FirebaseGuest.deleteByNumber(guestNumber)

    if (!result) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    console.log(`✅ Guest ${guestNumber} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: 'Guest deleted successfully',
      deletedGuest: result.deletedGuest,
    })
  } catch (error) {
    console.error('❌ Error deleting guest:', error)
    return NextResponse.json(
      { error: 'Failed to delete guest: ' + error.message },
      { status: 500 },
    )
  }
}
