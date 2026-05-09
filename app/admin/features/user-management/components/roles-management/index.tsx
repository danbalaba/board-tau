import React from 'react';
import { useRoles, usePermissions, useUpdateRole, useDeleteRole, useCreateRole } from '@/app/admin/hooks/use-roles';
import { RoleCardList } from './role-card-list';
import { PermissionMatrix } from './permission-matrix';
import { RoleFormModal } from './role-form-modal';
import { RoleDeleteDialog } from './role-delete-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import {
  IconShield,
  IconActivity,
  IconShieldCheck,
  IconLock,
  IconArrowUpRight,
  IconKeyframe,
} from '@tabler/icons-react';
import { AdminRolesHeader } from './admin-roles-header';

export function RolesManagement() {
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const createRole = useCreateRole();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<any>(null);

  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];

  const kpis = [
    {
      label: 'Total Permissions',
      value: permissions.length,
      icon: IconShieldCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      description: 'Defined access points'
    },
    {
      label: 'Governance Groups',
      value: roles.length,
      icon: IconShield,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      description: 'Configured role classes'
    },
    {
      label: 'RBAC Coverage',
      value: '100%',
      icon: IconLock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      description: 'Security span integrity'
    },
    {
      label: 'Posture Status',
      value: 'Optimal',
      icon: IconActivity,
      color: 'text-fuchsia-500',
      bg: 'bg-fuchsia-500/10',
      description: 'Identity vault health'
    },
  ];

  const handleCreateRole = async (data: any) => {
    try {
      await createRole.mutateAsync(data);
      toast.success('Role provisioned successfully.');
      setIsCreateModalOpen(false);
    } catch {
      toast.error('Failed to create role.');
    }
  };

  const handleUpdateRole = async (data: any) => {
    try {
      if (!selectedRole) return;
      await updateRole.mutateAsync({ id: selectedRole.id, roleData: data });
      toast.success('Role configuration updated.');
      setIsEditModalOpen(false);
    } catch {
      toast.error('Failed to update role.');
    }
  };

  const handleDeleteRole = async () => {
    try {
      if (!selectedRole) return;
      await deleteRole.mutateAsync(selectedRole.id);
      toast.success('Role decommissioned.');
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error('Failed to delete role.');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminRolesHeader onCreate={() => setIsCreateModalOpen(true)} />

      <div className="space-y-6">
        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.label}</CardTitle>
                  <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                    <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{kpi.value}</div>
                  <div className="flex items-center mt-2 gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-1 rounded-lg">
                    <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500")} />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{kpi.description}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Role Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <RoleCardList
            roles={roles}
            loading={rolesLoading}
            onEdit={(role) => { setSelectedRole(role); setIsEditModalOpen(true); }}
            onDelete={(role) => { setSelectedRole(role); setIsDeleteDialogOpen(true); }}
            onCreate={() => setIsCreateModalOpen(true)}
          />
        </motion.div>

        {/* Permission Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6 pl-4 border-l-[3px] border-emerald-500">
            <IconKeyframe className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">
              Permission Authority Matrix
            </h3>
          </div>
          <PermissionMatrix
            permissions={permissions}
            roles={roles}
            loading={permissionsLoading}
          />
        </motion.div>
      </div>

      {/* Modals */}
      <RoleFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateRole}
        title="Provision New Role"
        description="Define a new governance role and assign access permissions."
      />
      <RoleFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateRole}
        initialData={selectedRole}
        title="Edit Role Configuration"
        description={`Modify the access policy for ${selectedRole?.name}`}
      />
      <RoleDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRole}
        roleName={selectedRole?.name}
      />
    </div>
  );
}
