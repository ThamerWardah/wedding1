import { NextResponse } from 'next/server'
import { FirebaseGuest } from '../../../models/FirebaseGuest'

export async function GET() {
  try {
    const guests = await FirebaseGuest.findAll()
    return NextResponse.json(guests)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch guests: ' + error.message },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const result = await FirebaseGuest.create(body)

    return NextResponse.json({
      success: true,
      guestNumber: result.guestNumber,
      guest: result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create guest: ' + error.message },
      { status: 500 },
    )
  }
}
