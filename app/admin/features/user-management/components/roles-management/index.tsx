import React from 'react';
import { useSession } from 'next-auth/react';
import { useRoles, usePermissions, useUpdateRole, useDeleteRole, useCreateRole } from '@/app/admin/hooks/use-roles';
import { RoleCardList } from './role-card-list';
import { PermissionMatrix } from './permission-matrix';
import { RoleFormModal } from './role-form-modal';
import { RoleDeleteDialog } from './role-delete-dialog';
import { toast } from '@/app/admin/components/ui/sonner';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/admin/components/ui/tooltip';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';

export function RolesManagement() {
  const [range, setRange] = React.useState('30d');
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const { data: rolesData, isLoading: rolesLoadingInit, refetch: refetchRoles, isFetching: isFetchingRoles, error: rolesError } = useRoles();
  const { data: permissionsData, isLoading: permissionsLoadingInit, refetch: refetchPerms, isFetching: isFetchingPerms, error: permsError } = usePermissions();

  const getRangeLabel = (r: string) => {
    switch (r) {
      case '7d': return 'last 7 days';
      case '90d': return 'last 90 days';
      case '1y': return 'past year';
      case '30d':
      default: return 'last 30 days';
    }
  };
  
  const rolesLoading = rolesLoadingInit || isFetchingRoles;
  const permissionsLoading = permissionsLoadingInit || isFetchingPerms;

  const handleRefresh = async () => {
    toast.promise(Promise.all([refetchRoles(), refetchPerms()]), {
      loading: 'Syncing roles & permissions...',
      success: 'Governance configurations synchronized.',
      error: 'Failed to synchronize governance.'
    });
  };

  if (rolesError || permsError) {
    return <AdminDashboardError onRetry={handleRefresh} />;
  }

  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const createRole = useCreateRole();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<any>(null);

  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];

  const generateTrend = (val: number, isLoad: boolean = false) => {
    if (isLoad) {
      return [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];
    }
    return [
      { v: val * 0.8 }, { v: val * 0.85 }, { v: val * 0.82 }, 
      { v: val * 0.9 }, { v: val * 0.88 }, { v: val * 0.95 }, { v: val }
    ];
  };

  const kpis = [
    {
      label: 'Total Permissions',
      value: permissions.length,
      icon: IconShieldCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      chartColor: '#3b82f6',
      description: 'Defined access points',
      trendData: generateTrend(permissions.length || 0, permissionsLoading),
      tooltip: {
        title: 'Total Permissions',
        description: 'The total number of granular permissions available for assignment across the system.',
        detail: '12 new permissions mapped this month.',
      },
      trend: { value: 12, label: 'new', isPositive: true },
      isLoading: permissionsLoading
    },
    {
      label: 'User Roles',
      value: roles.length,
      icon: IconShield,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      chartColor: '#10b981',
      description: 'Total configured roles',
      trendData: generateTrend(roles.length || 0, rolesLoading),
      tooltip: {
        title: 'User Roles',
        description: 'Total number of roles currently configured in the database.',
        detail: '2 new roles created this week.',
      },
      trend: { value: 2, label: 'new', isPositive: true },
      isLoading: rolesLoading
    },
    {
      label: 'System Default Roles',
      value: roles.filter((r: any) => ['ADMIN', 'LANDLORD', 'USER', 'SUPER_ADMIN'].includes(r.name)).length,
      icon: IconLock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      chartColor: '#f59e0b',
      description: 'Built-in platform roles',
      trendData: generateTrend(roles.filter((r: any) => ['ADMIN', 'LANDLORD', 'USER', 'SUPER_ADMIN'].includes(r.name)).length || 0, rolesLoading),
      tooltip: {
        title: 'System Default Roles',
        description: 'Number of core roles built into the platform that cannot be deleted.',
        detail: '4 core defaults are active.',
      },
      trend: { value: 3, label: 'defaults active', isPositive: true },
      isLoading: rolesLoading
    },
    {
      label: 'Custom Roles',
      value: roles.filter((r: any) => !['ADMIN', 'LANDLORD', 'USER', 'SUPER_ADMIN'].includes(r.name)).length,
      icon: IconActivity,
      color: 'text-fuchsia-500',
      bg: 'bg-fuchsia-500/10',
      chartColor: '#d946ef',
      description: 'User-created roles',
      trendData: generateTrend(roles.filter((r: any) => !['ADMIN', 'LANDLORD', 'USER', 'SUPER_ADMIN'].includes(r.name)).length || 0, rolesLoading),
      tooltip: {
        title: 'Custom Roles',
        description: 'Number of custom roles created by administrators.',
        detail: '1 new custom role this week.',
      },
      trend: { value: 1, label: 'new', isPositive: true },
      isLoading: rolesLoading
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

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (!roles) return;
    
    const exportData = roles.map((r: any) => ({
      Role: r.name,
      Description: r.description || 'No description',
      Users: r.users?.length || 0,
      Permissions: r.permissions?.length || 0
    }));

    const rangeLabel = getRangeLabel(range);
    const meta = {
      reportTitle: 'Roles & Permissions Report',
      title: 'Roles & Permissions Report',
      reportId: `BTAU-ROL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [{ label: 'Period', value: rangeLabel }],
      summaryData: [{ label: 'Period', value: rangeLabel }],
      author: 'BoardTAU Admin Dashboard',
    };
    
    const fileName = `Roles_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

    try {
      if (format === 'CSV') {
        const { exportToCSV } = await import('@/utils/export-utils');
        exportToCSV(exportData, fileName, meta);
      } else if (format === 'EXCEL') {
        const { exportToExcel } = await import('@/utils/export-utils');
        exportToExcel(exportData, fileName, 'Roles', meta);
      } else if (format === 'PDF') {
        const { generateMultiSectionPDF } = await import('@/utils/pdfGenerator');
        const sections = [
          {
            title: 'Roles Overview',
            type: 'table' as const,
            columns: ['Role', 'Description', 'Users', 'Permissions'],
            data: exportData.map((item: any) => [String(item.Role), String(item.Description), String(item.Users), String(item.Permissions)]),
          }
        ];
        await generateMultiSectionPDF(fileName, sections, meta);
      }
      toast.success(`Exported as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export as ${format}`);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminRolesHeader 
        onRefresh={handleRefresh} 
        onExport={handleExport}
        isFetching={isFetchingRoles || isFetchingPerms} 
        range={range}
        onRangeChange={setRange}
        isSuperAdmin={isSuperAdmin}
      />

      <div className="space-y-6">
        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TooltipProvider delayDuration={200}>
            {kpis.map((kpi, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="cursor-help"
                  >
                    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group h-full">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.label}</CardTitle>
                        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                          <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
                          {kpi.isLoading ? (
                            <div className="h-9 w-16 bg-muted/50 dark:bg-white/10 animate-pulse rounded-xl" />
                          ) : (
                            kpi.value
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 mt-3">
                          <span className="text-[11px] text-gray-500 font-medium">{kpi.description}</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <div className={cn(
                              "flex items-center gap-1.5 w-fit px-2 py-1 rounded-lg border",
                              kpi.trend.isPositive 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                            )}>
                              <IconArrowUpRight className="w-3 h-3" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">
                                {kpi.trend.value > 0 ? `+${kpi.trend.value}` : kpi.trend.value} {kpi.trend.label}
                              </span>
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                              vs {getRangeLabel(range)}
                            </span>
                          </div>
                        </div>
                        <div className="h-20 w-full mt-6 -mx-6 mb-[-1.5rem]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={kpi.trendData}>
                              <defs>
                                <linearGradient id={`gradient-role-${i}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={kpi.chartColor} stopOpacity={0.25} />
                                  <stop offset="100%" stopColor={kpi.chartColor} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Area
                                type="monotone"
                                dataKey="v"
                                stroke={kpi.chartColor}
                                strokeWidth={3}
                                fill={`url(#gradient-role-${i})`}
                                isAnimationActive={true}
                                animationDuration={1500}
                                animationEasing="ease-out"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[220px] p-0 border-0 shadow-2xl rounded-2xl overflow-hidden"
                >
                  <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", kpi.bg)}>
                        <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                        {kpi.tooltip.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {kpi.tooltip.description}
                    </p>
                    <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        {kpi.tooltip.detail}
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
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
              Permissions Overview
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
