import type { Guest } from '@/types'

const BASE = '/api/guests'

export const guestsApi = {
  list: async (): Promise<Guest[]> => {
    const res = await fetch(BASE)
    if (!res.ok) throw new Error('Failed to fetch guests')
    return res.json()
  },

  get: async (id: number): Promise<Guest> => {
    const res = await fetch(`${BASE}/${id}`)
    if (!res.ok) throw new Error('Failed to fetch guest')
    return res.json()
  },

  create: async (data: Partial<Guest>): Promise<Guest> => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create guest')
    return res.json()
  },

  update: async (id: number, data: Partial<Guest>): Promise<Guest> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update guest')
    return res.json()
  },
}
