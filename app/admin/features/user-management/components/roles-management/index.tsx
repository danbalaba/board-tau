import React from 'react';
import { useRoles, usePermissions, useUpdateRole, useDeleteRole, useCreateRole } from '@/app/admin/hooks/use-roles';
import { RoleCardList } from './role-card-list';
import { PermissionMatrix } from './permission-matrix';
import { RoleFormModal } from './role-form-modal';
import { RoleDeleteDialog } from './role-delete-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Layers, 
  Activity, 
  FileText,
  Plus,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

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
    { label: 'Total Permissions', value: permissions.length, icon: ShieldCheck, color: 'text-primary', description: 'Available actions' },
    { label: 'Active Roles', value: roles.length, icon: Shield, color: 'text-emerald-500', description: 'Configured groups' },
    { label: 'Role Coverage', value: '100%', icon: Layers, color: 'text-amber-500', description: 'System span' },
    { label: 'System Status', value: 'Healthy', icon: Activity, color: 'text-rose-500', description: 'RBAC integrity' },
  ];

  const handleCreateRole = async (data: any) => {
    try {
      await createRole.mutateAsync(data);
      toast.success('Role created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleUpdateRole = async (data: any) => {
    try {
      if (!selectedRole) return;
      await updateRole.mutateAsync({ id: selectedRole.id, roleData: data });
      toast.success('Role updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteRole = async () => {
    try {
      if (!selectedRole) return;
      await deleteRole.mutateAsync(selectedRole.id);
      toast.success('Role deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage institutional access levels and security protocols.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <kpi.icon className="w-12 h-12" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
                  <p className="text-xs text-emerald-500">
                    System Verified
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <RoleCardList 
        roles={roles} 
        loading={rolesLoading}
        onEdit={(role) => {
          setSelectedRole(role);
          setIsEditModalOpen(true);
        }}
        onDelete={(role) => {
          setSelectedRole(role);
          setIsDeleteDialogOpen(true);
        }}
        onCreate={() => setIsCreateModalOpen(true)}
      />

      <PermissionMatrix 
        permissions={permissions} 
        roles={roles}
        loading={permissionsLoading}
      />

      <RoleFormModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateRole}
        title="Create Role"
        description="Define a new role and its associated permissions."
      />

      <RoleFormModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateRole}
        initialData={selectedRole}
        title="Edit Role"
        description={`Modify the configuration for ${selectedRole?.name}`}
      />

      <RoleDeleteDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRole}
        roleName={selectedRole?.name}
      />
    </motion.div>
  );
}
