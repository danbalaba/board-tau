'use client';

import React from 'react';
import { UserTable } from './user-tables';
import { columns, User, ROLE_OPTIONS, STATUS_OPTIONS } from './user-tables/columns';
import { useUsers } from '@/app/admin/hooks/use-users';
import { parseAsString, useQueryState } from 'nuqs';

export function UserDirectory() {
  const [pageSize] = useQueryState('perPage', parseAsString.withDefault('10'));
  const [page] = useQueryState('page', parseAsString.withDefault('1'));
  const [name] = useQueryState('name', parseAsString.withDefault(''));
  const [email] = useQueryState('email', parseAsString.withDefault(''));
  const [role] = useQueryState('role', parseAsString.withDefault(''));
  const [status] = useQueryState('status', parseAsString.withDefault(''));

  // Fetch real data from the API
  const { data, isLoading, error } = useUsers({
    page: parseInt(page),
    perPage: parseInt(pageSize),
    name: name || undefined,
    email: email || undefined,
    role: role || undefined,
    status: status || undefined,
  });

  // Debug logs to see what's happening
  console.log('API Response:', data);
  console.log('Data?.data:', data?.data);
  console.log('Data type:', typeof data?.data);
  if (data?.data) {
    console.log('Data length:', data?.data.length);
    console.log('First user:', data?.data[0]);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Directory</h2>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Directory</h2>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error loading users: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Directory</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
      </div>

      <UserTable
        data={data?.data || []}
        totalItems={data?.meta?.total || 0}
        columns={columns as any}
      />
    </div>
  );
}
