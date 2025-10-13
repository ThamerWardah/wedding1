import { NextResponse } from 'next/server'
import { FirebaseSettings } from '../../../models/FirebaseSettings'

export async function GET() {
  try {
    const settings = await FirebaseSettings.getWeddingSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings: ' + error.message },
      { status: 500 },
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const result = await FirebaseSettings.updateSettings(body)

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings: ' + error.message },
      { status: 500 },
    )
  }
}
