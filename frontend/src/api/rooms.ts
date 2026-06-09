import type { Room } from '@/types'

const BASE = '/api/rooms'

export const roomsApi = {
  listByProperty: async (propertyId: number): Promise<Room[]> => {
    const res = await fetch(`/api/properties/${propertyId}/rooms`)
    if (!res.ok) throw new Error('Failed to fetch rooms')
    return res.json()
  },

  get: async (id: number): Promise<Room> => {
    const res = await fetch(`${BASE}/${id}`)
    if (!res.ok) throw new Error('Failed to fetch room')
    return res.json()
  },

  create: async (propertyId: number, data: Partial<Room>): Promise<Room> => {
    const res = await fetch(`/api/properties/${propertyId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create room')
    return res.json()
  },

  update: async (id: number, data: Partial<Room>): Promise<Room> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update room')
    return res.json()
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete room')
  },
}
