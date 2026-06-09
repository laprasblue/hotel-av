import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservationsApi } from '@/api/reservations'
import type { Reservation } from '@/types'

export const useReservations = (propertyId?: number) =>
  useQuery({
    queryKey: ['reservations', propertyId],
    queryFn: () => reservationsApi.list(propertyId),
  })

export const useReservation = (id: number) =>
  useQuery({
    queryKey: ['reservations', 'detail', id],
    queryFn: () => reservationsApi.get(id),
    enabled: !!id,
  })

export const useCreateReservation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Reservation>) => reservationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

export const useUpdateReservation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Reservation> }) =>
      reservationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
}
