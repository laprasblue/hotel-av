import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomsApi } from '@/api/rooms'
import type { Room } from '@/types'

export const useRooms = (propertyId: number) =>
  useQuery({
    queryKey: ['rooms', propertyId],
    queryFn: () => roomsApi.listByProperty(propertyId),
    enabled: !!propertyId,
  })

export const useRoom = (id: number) =>
  useQuery({
    queryKey: ['rooms', 'detail', id],
    queryFn: () => roomsApi.get(id),
    enabled: !!id,
  })

export const useCreateRoom = (propertyId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Room>) => roomsApi.create(propertyId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms', propertyId] }),
  })
}

export const useUpdateRoom = (propertyId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Room> }) =>
      roomsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms', propertyId] }),
  })
}

export const useDeleteRoom = (propertyId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => roomsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms', propertyId] }),
  })
}
