import type { Reservation } from '@/types'

const BASE = '/api/reservations'

export const reservationsApi = {
  list: async (propertyId?: number): Promise<Reservation[]> => {
    const url = propertyId ? `${BASE}?propertyId=${propertyId}` : BASE
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch reservations')
    return res.json()
  },

  get: async (id: number): Promise<Reservation> => {
    const res = await fetch(`${BASE}/${id}`)
    if (!res.ok) throw new Error('Failed to fetch reservation')
    return res.json()
  },

  create: async (data: Partial<Reservation>): Promise<Reservation> => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create reservation')
    return res.json()
  },

  update: async (id: number, data: Partial<Reservation>): Promise<Reservation> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update reservation')
    return res.json()
  },
}
