import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { guestsApi } from '@/api/guests'
import type { Guest } from '@/types'

export const useGuests = () =>
  useQuery({ queryKey: ['guests'], queryFn: guestsApi.list })

export const useGuest = (id: number) =>
  useQuery({
    queryKey: ['guests', id],
    queryFn: () => guestsApi.get(id),
    enabled: !!id,
  })

export const useCreateGuest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Guest>) => guestsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  })
}

export const useUpdateGuest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Guest> }) =>
      guestsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  })
}
