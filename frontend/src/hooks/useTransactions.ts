import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '@/api/transactions'
import type { Transaction } from '@/types'

export const useTransactions = (propertyId?: number) =>
  useQuery({
    queryKey: ['transactions', propertyId],
    queryFn: () => transactionsApi.list(propertyId),
  })

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => transactionsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
