export interface RoomAvailability {
  id: number
  propertyId: number
  name: string
  type: string
  capacity?: number
  available: boolean
  conflictingReservation: {
    id: number
    reservationNumber: string
    guestId?: number
    guest?: { fullName: string }
    checkInTime: string
    checkOutTime: string
    status: string
  } | null
}

export async function fetchAvailability(
  propertyId: number,
  checkIn: string,
  checkOut: string,
): Promise<RoomAvailability[]> {
  const params = new URLSearchParams({ propertyId: String(propertyId), checkIn, checkOut })
  const res = await fetch(`/api/availability?${params}`)
  if (!res.ok) throw new Error('Failed to fetch availability')
  return res.json()
}
