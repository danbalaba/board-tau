'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Shield, User, Edit, Trash2 } from 'lucide-react';
import { useRoles, usePermissions } from '@/app/admin/hooks/use-roles';

export function RolesManagement() {
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: permissionsData, isLoading: permissionsLoading, error: permissionsError } = usePermissions();

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-500" />
                    <span>Loading...</span>
                  </CardTitle>
                  <Badge variant="secondary">0 users</Badge>
                </div>
                <CardDescription>Loading...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Permissions:</span>
                    <span className="text-sm text-muted-foreground">0</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, j) => (
                      <Badge key={j} variant="outline" className="text-xs">
                        Loading...
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (rolesError || permissionsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
            <p className="text-muted-foreground">Error loading data</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error: {rolesError?.message || permissionsError?.message}
          </div>
        </div>
      </div>
    );
  }

  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];

  // Helper function to get roles that have a specific permission
  const getRolesWithPermission = (permissionName: string) => {
    return roles.filter(role => role.permissions.includes(permissionName));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  {role.name === 'Admin' ? (
                    <Shield className="h-5 w-5 text-red-500" />
                  ) : (
                    <User className="h-5 w-5 text-blue-500" />
                  )}
                  <span>{role.name}</span>
                </CardTitle>
                <Badge variant="secondary">{role.userCount} users</Badge>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Permissions:</span>
                  <span className="text-sm text-muted-foreground">{role.permissions.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2 pt-2">
                  <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  {role.name !== 'Admin' && (
                    <button className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Permissions List</CardTitle>
          <CardDescription>Complete list of all available permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell>{permission.description || 'No description'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {getRolesWithPermission(permission.name).map((role) => (
                        <Badge
                          key={role.id}
                          variant={role.name === 'Admin' ? 'destructive' : role.name === 'Host' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
