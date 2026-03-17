import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    totalPages?: number;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  listingId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  durationInDays: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; image: string };
  listing: { id: string; title: string; description: string; imageSrc: string };
  room: any;
}

export interface TransactionsQueryParams {
  page?: number;
  perPage?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  dateRange?: string;
}

export function useTransactions(params?: TransactionsQueryParams) {
  const { page = 1, perPage = 10, paymentStatus = '', paymentMethod = '', dateRange = '' } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    ...(paymentStatus && { paymentStatus }),
    ...(paymentMethod && { paymentMethod }),
    ...(dateRange && { dateRange }),
  }).toString();

  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/finance/transactions?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch transactions');
      }

      const data: ApiResponse<Transaction[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch transactions');
      }

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/finance/transactions/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch transaction');
      }

      const data: ApiResponse<Transaction> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch transaction');
      }

      return data;
    },
  });
}
