import type { Property } from '@/types'

const BASE = '/api/properties'

export const propertiesApi = {
  list: async (): Promise<Property[]> => {
    const res = await fetch(BASE)
    if (!res.ok) throw new Error('Failed to fetch properties')
    return res.json()
  },

  get: async (id: number): Promise<Property> => {
    const res = await fetch(`${BASE}/${id}`)
    if (!res.ok) throw new Error('Failed to fetch property')
    return res.json()
  },

  create: async (data: Partial<Property>): Promise<Property> => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create property')
    return res.json()
  },

  update: async (id: number, data: Partial<Property>): Promise<Property> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update property')
    return res.json()
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete property')
  },
}
