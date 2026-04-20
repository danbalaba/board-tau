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
import { Button } from '@/app/admin/components/ui/button';
import { Badge } from '@/app/admin/components/ui/badge';
import {
  IconShield,
  IconActivity,
  IconPlus,
  IconShieldCheck,
  IconLock,
  IconAdjustmentsHorizontal,
  IconArrowUpRight,
  IconKeyframe,
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';

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
      color: 'text-primary',
      bg: 'bg-primary/10',
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
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
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
    <PageContainer
      pageTitle="Security Governance"
      pageDescription="Manage institutional access levels, RBAC policies, and multi-tenant privilege delegation"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 hover:bg-white/5 border-border/40 font-black uppercase text-[10px] tracking-widest">
            <IconAdjustmentsHorizontal className="w-4 h-4" />
            Policy Audit
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
          >
            <IconPlus className="w-4 h-4" />
            Define Role
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {kpi.label}
                  </CardTitle>
                  <div className={cn('p-2 rounded-xl transition-transform group-hover:scale-110', kpi.bg)}>
                    <kpi.icon className={cn('w-4 h-4', kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black tabular-nums">{kpi.value}</div>
                  <div className="flex items-center mt-1.5 gap-1">
                    <IconArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-500/80">{kpi.description}</p>
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
          {/* Section divider */}
          <div className="flex items-center gap-3 mb-6 pl-4 border-l-[3px] border-primary/60">
            <IconKeyframe className="w-4 h-4 text-primary/60" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/70">
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
    </PageContainer>
  );
}
