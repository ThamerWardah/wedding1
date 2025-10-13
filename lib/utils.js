export function generateArabicDate(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return new Date(date).toLocaleDateString('ar-EG', options)
}

export function validateGuestNumber(number) {
  return /^\d+$/.test(number) && number.length >= 4
}

export function getAttendanceStats(guests) {
  const total = guests.length
  const confirmed = guests.filter((g) => g.status === 'confirmed').length
  const declined = guests.filter((g) => g.status === 'declined').length
  const pending = guests.filter((g) => g.status === 'pending').length

  const totalGuests = guests
    .filter((g) => g.status === 'confirmed')
    .reduce((sum, guest) => sum + (guest.attendance?.guestsCount || 1), 0)

  return { total, confirmed, declined, pending, totalGuests }
}
