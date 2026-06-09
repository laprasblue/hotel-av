import type { Transaction } from '@/types'

const BASE = '/api/transactions'

export const transactionsApi = {
  list: async (propertyId?: number): Promise<Transaction[]> => {
    const url = propertyId ? `${BASE}?propertyId=${propertyId}` : BASE
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch transactions')
    return res.json()
  },

  create: async (data: Partial<Transaction>): Promise<Transaction> => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create transaction')
    return res.json()
  },
}
