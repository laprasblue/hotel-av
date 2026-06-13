import { http, HttpResponse } from 'msw'
import { PROPERTIES, ROOMS, GUESTS, RESERVATIONS, TRANSACTIONS } from './seed'
import type { Property, Room, Guest, Reservation, Transaction } from '@/types'

// In-memory stores (seeded from static data)
let properties: Property[] = [...PROPERTIES]
let rooms: Room[] = [...ROOMS]
let guests: Guest[] = [...GUESTS]
let reservations: Reservation[] = [...RESERVATIONS]
let transactions: Transaction[] = [...TRANSACTIONS]

let nextId = {
  property: Math.max(...properties.map((p) => p.id)) + 1,
  room: Math.max(...rooms.map((r) => r.id)) + 1,
  guest: Math.max(...guests.map((g) => g.id)) + 1,
  reservation: Math.max(...reservations.map((r) => r.id)) + 1,
  transaction: Math.max(...transactions.map((t) => t.id)) + 1,
}

const now = () => new Date().toISOString()
const delay = () => new Promise((r) => setTimeout(r, 200))

export const handlers = [
  // ─── Auth ────────────────────────────────────────────
  http.post('/api/auth/login', async ({ request }) => {
    await delay()
    const body = await request.json() as { email: string; password: string }
    if (body.password === '123456') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Admin', email: body.email, role: 'ADMIN' },
      })
    }
    return HttpResponse.json({ message: 'Sai mật khẩu' }, { status: 401 })
  }),

  // ─── Properties ──────────────────────────────────────
  http.get('/api/properties', async () => {
    await delay()
    return HttpResponse.json(properties)
  }),

  http.get('/api/properties/:id', async ({ params }) => {
    await delay()
    const prop = properties.find((p) => p.id === Number(params.id))
    if (!prop) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(prop)
  }),

  http.post('/api/properties', async ({ request }) => {
    await delay()
    const body = await request.json() as Partial<Property>
    const newProp: Property = {
      id: nextId.property++,
      name: body.name ?? '',
      type: body.type ?? 'HOTEL',
      description: body.description,
      phone: body.phone,
      address: body.address,
      images: body.images ?? [],
      amenities: body.amenities ?? [],
      checkInInstructions: body.checkInInstructions,
      notes: body.notes,
      createdAt: now(),
      updatedAt: now(),
    }
    properties.push(newProp)
    return HttpResponse.json(newProp, { status: 201 })
  }),

  http.put('/api/properties/:id', async ({ params, request }) => {
    await delay()
    const idx = properties.findIndex((p) => p.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const body = await request.json() as Partial<Property>
    properties[idx] = { ...properties[idx], ...body, updatedAt: now() }
    return HttpResponse.json(properties[idx])
  }),

  http.delete('/api/properties/:id', async ({ params }) => {
    await delay()
    properties = properties.filter((p) => p.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  // ─── Rooms ───────────────────────────────────────────
  http.get('/api/properties/:propertyId/rooms', async ({ params }) => {
    await delay()
    const propRooms = rooms.filter((r) => r.propertyId === Number(params.propertyId))
    return HttpResponse.json(propRooms)
  }),

  http.post('/api/properties/:propertyId/rooms', async ({ params, request }) => {
    await delay()
    const body = await request.json() as Partial<Room>
    const newRoom: Room = {
      id: nextId.room++,
      propertyId: Number(params.propertyId),
      name: body.name ?? '',
      type: body.type ?? 'STANDARD',
      description: body.description,
      address: body.address,
      capacity: body.capacity,
      images: body.images ?? [],
      notes: body.notes,
      createdAt: now(),
      updatedAt: now(),
    }
    rooms.push(newRoom)
    return HttpResponse.json(newRoom, { status: 201 })
  }),

  http.get('/api/rooms/:id', async ({ params }) => {
    await delay()
    const room = rooms.find((r) => r.id === Number(params.id))
    if (!room) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(room)
  }),

  http.put('/api/rooms/:id', async ({ params, request }) => {
    await delay()
    const idx = rooms.findIndex((r) => r.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const body = await request.json() as Partial<Room>
    rooms[idx] = { ...rooms[idx], ...body, updatedAt: now() }
    return HttpResponse.json(rooms[idx])
  }),

  http.delete('/api/rooms/:id', async ({ params }) => {
    await delay()
    rooms = rooms.filter((r) => r.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  // ─── Guests ──────────────────────────────────────────
  http.get('/api/guests', async () => {
    await delay()
    return HttpResponse.json(guests)
  }),

  http.get('/api/guests/:id', async ({ params }) => {
    await delay()
    const guest = guests.find((g) => g.id === Number(params.id))
    if (!guest) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(guest)
  }),

  http.post('/api/guests', async ({ request }) => {
    await delay()
    const body = await request.json() as Partial<Guest>
    const newGuest: Guest = {
      id: nextId.guest++,
      fullName: body.fullName ?? '',
      phone: body.phone,
      email: body.email,
      nationality: body.nationality,
      documentNumber: body.documentNumber,
      documentImages: body.documentImages ?? [],
      address: body.address,
      notes: body.notes,
      createdAt: now(),
    }
    guests.push(newGuest)
    return HttpResponse.json(newGuest, { status: 201 })
  }),

  http.put('/api/guests/:id', async ({ params, request }) => {
    await delay()
    const idx = guests.findIndex((g) => g.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const body = await request.json() as Partial<Guest>
    guests[idx] = { ...guests[idx], ...body }
    return HttpResponse.json(guests[idx])
  }),

  // ─── Reservations ─────────────────────────────────────
  http.get('/api/reservations', async ({ request }) => {
    await delay()
    const url = new URL(request.url)
    const propertyId = url.searchParams.get('propertyId')
    const result = propertyId
      ? reservations.filter((r) => r.propertyId === Number(propertyId))
      : reservations
    return HttpResponse.json(result)
  }),

  http.get('/api/reservations/:id', async ({ params }) => {
    await delay()
    const res = reservations.find((r) => r.id === Number(params.id))
    if (!res) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(res)
  }),

  http.post('/api/reservations', async ({ request }) => {
    await delay()
    const body = await request.json() as Partial<Reservation>
    const num = `RES-${new Date().getFullYear()}-${String(nextId.reservation).padStart(3, '0')}`
    const newRes: Reservation = {
      id: nextId.reservation++,
      reservationNumber: num,
      propertyId: body.propertyId ?? 0,
      roomId: body.roomId ?? 0,
      guestId: body.guestId,
      checkInTime: body.checkInTime ?? now(),
      checkOutTime: body.checkOutTime ?? now(),
      price: body.price ?? 0,
      discount: body.discount ?? 0,
      finalPrice: (body.price ?? 0) - (body.discount ?? 0),
      surcharges: body.surcharges,
      notes: body.notes,
      status: 'PENDING',
      createdAt: now(),
      updatedAt: now(),
    }
    reservations.push(newRes)
    return HttpResponse.json(newRes, { status: 201 })
  }),

  http.put('/api/reservations/:id', async ({ params, request }) => {
    await delay()
    const idx = reservations.findIndex((r) => r.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const body = await request.json() as Partial<Reservation>
    reservations[idx] = { ...reservations[idx], ...body, updatedAt: now() }
    return HttpResponse.json(reservations[idx])
  }),

  // ─── Transactions ─────────────────────────────────────
  http.get('/api/transactions', async ({ request }) => {
    await delay()
    const url = new URL(request.url)
    const propertyId = url.searchParams.get('propertyId')
    const result = propertyId
      ? transactions.filter((t) => t.propertyId === Number(propertyId))
      : transactions
    return HttpResponse.json(result)
  }),

  http.post('/api/transactions', async ({ request }) => {
    await delay()
    const body = await request.json() as Partial<Transaction>
    const newTx: Transaction = {
      id: nextId.transaction++,
      amount: body.amount ?? 0,
      type: body.type ?? 'INCOME',
      date: body.date ?? now(),
      description: body.description ?? '',
      notes: body.notes,
      createdBy: body.createdBy ?? 'Admin',
      propertyId: body.propertyId ?? 0,
      createdAt: now(),
    }
    transactions.push(newTx)
    return HttpResponse.json(newTx, { status: 201 })
  }),

  // ─── Availability ────────────────────────────────────
  http.get('/api/availability', async ({ request }) => {
    await delay()
    const url = new URL(request.url)
    const propertyId = Number(url.searchParams.get('propertyId'))
    const checkIn = url.searchParams.get('checkIn')
    const checkOut = url.searchParams.get('checkOut')

    if (!propertyId || !checkIn || !checkOut) {
      return HttpResponse.json({ message: 'Missing params' }, { status: 400 })
    }

    const checkInMs = new Date(checkIn).getTime()
    const checkOutMs = new Date(checkOut).getTime()

    const conflictMap = new Map<number, Reservation>()
    reservations
      .filter(
        (r) =>
          r.propertyId === propertyId &&
          r.status !== 'CANCELLED' &&
          new Date(r.checkInTime).getTime() < checkOutMs &&
          new Date(r.checkOutTime).getTime() > checkInMs
      )
      .forEach((r) => conflictMap.set(r.roomId, r))

    const propRooms = rooms.filter((r) => r.propertyId === propertyId)
    const result = propRooms.map((r) => {
      const conflict = conflictMap.get(r.id) ?? null
      return {
        ...r,
        available: !conflict,
        conflictingReservation: conflict
          ? {
              id: conflict.id,
              reservationNumber: conflict.reservationNumber,
              guestId: conflict.guestId,
              guest: conflict.guest,
              checkInTime: conflict.checkInTime,
              checkOutTime: conflict.checkOutTime,
              status: conflict.status,
            }
          : null,
      }
    })

    return HttpResponse.json(result)
  }),

  // ─── Dashboard ────────────────────────────────────────
  http.get('/api/dashboard/revenue', async ({ request }) => {
    await delay()
    const url = new URL(request.url)
    const propertyId = Number(url.searchParams.get('propertyId'))
    const propReservations = reservations.filter(
      (r) => r.propertyId === propertyId && r.status !== 'CANCELLED'
    )
    const today = new Date().toDateString()
    const revenueToday = propReservations
      .filter((r) => new Date(r.createdAt).toDateString() === today)
      .reduce((s, r) => s + r.finalPrice, 0)
    return HttpResponse.json({
      revenueToday,
      revenueThisWeek: revenueToday * 4.2,
      revenueThisMonth: revenueToday * 18,
      occupancyRate: 76,
      totalReservations: propReservations.length,
    })
  }),
]
