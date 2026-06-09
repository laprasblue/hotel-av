import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertiesApi } from '@/api/properties'
import type { Property } from '@/types'

export const useProperties = () =>
  useQuery({ queryKey: ['properties'], queryFn: propertiesApi.list })

export const useProperty = (id: number) =>
  useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertiesApi.get(id),
    enabled: !!id,
  })

export const useCreateProperty = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Property>) => propertiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export const useUpdateProperty = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Property> }) =>
      propertiesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export const useDeleteProperty = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => propertiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}
