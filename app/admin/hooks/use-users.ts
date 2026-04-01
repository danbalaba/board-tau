import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
  lastLogin: string;
  emailVerified: boolean;
  listingsCount: number;
  bookingsCount: number;
  totalSpent: number;
}

export interface UsersQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export function useUsers(params?: UsersQueryParams) {
  // For client-side filtering, we need to fetch all users
  return useQuery({
    queryKey: ['users'], // Fixed query key to prevent refetching on search
    queryFn: async () => {
      const response = await fetch('/api/admin/users?perPage=1000'); // Fetch all users

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data: ApiResponse<User[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user');
      }

      const data: ApiResponse<User> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch user');
      }

      return data;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<User> }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const data: any = await response.json();

      // The API doesn't return data.success, so we need to check differently
      if (!data.message || data.message.includes('Failed')) {
        throw new Error(data.message || 'Failed to update user');
      }

      return data;
    },
    onMutate: async ({ id, userData }) => {
      // Cancel any outgoing refetches for the 'users' query
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically update the users list
      queryClient.setQueryData(['users'], (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((user: User) =>
            user.id === id ? { ...user, ...userData } : user
          ),
        };
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Revert back to the previous users list if there's an error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
    },
    onSettled: () => {
      // Invalidate the 'users' query to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const data: any = await response.json();

      if (!data.message || data.message.includes('Failed')) {
        throw new Error(data.message || 'Failed to delete user');
      }

      return data;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches for the 'users' query
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically remove the user from the list
      queryClient.setQueryData(['users'], (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.filter((user: User) => user.id !== id),
        };
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Revert back to the previous users list if there's an error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
    },
    onSettled: () => {
      // Invalidate the 'users' query to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }

      const data: any = await response.json();

      if (!data.message || data.message.includes('Failed')) {
        throw new Error(data.message || 'Failed to update user status');
      }

      return data;
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches for the 'users' query
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically update the user's status
      queryClient.setQueryData(['users'], (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((user: User) =>
            user.id === id ? { ...user, status } : user
          ),
        };
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Revert back to the previous users list if there's an error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
    },
    onSettled: () => {
      // Invalidate the 'users' query to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const data: ApiResponse<User> = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate the 'users' query to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
