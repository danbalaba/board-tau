import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import {
  IconShieldCheck,
  IconShieldExclamation,
  IconUsers,
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconSettings,
  IconPlus
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/app/admin/components/ui/dropdown-menu';

interface RoleCardListProps {
  roles: any[];
  loading: boolean;
  onEdit: (role: any) => void;
  onDelete: (role: any) => void;
  onCreate: () => void;
}

const roleColorMap: Record<string, { icon: React.ElementType; color: string; bg: string; accent: string }> = {
  ADMIN: { icon: IconShieldExclamation, color: 'text-rose-500', bg: 'bg-rose-500/10', accent: 'bg-rose-500' },
  LANDLORD: { icon: IconShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10', accent: 'bg-blue-500' },
  USER: { icon: IconUsers, color: 'text-emerald-500', bg: 'bg-emerald-500/10', accent: 'bg-emerald-500' },
};
const defaultRoleStyle = { icon: IconSettings, color: 'text-gray-500', bg: 'bg-gray-500/10', accent: 'bg-gray-500' };

export function RoleCardList({ roles, loading, onEdit, onDelete, onCreate }: RoleCardListProps) {
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-56 bg-white/40 dark:bg-gray-900/40 rounded-[2rem] border border-gray-100 dark:border-gray-800" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">
            Active Role Registry · {roles.length} Governance Groups
          </h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onCreate}
          className="h-10 px-4 gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-all shadow-sm"
        >
          <IconPlus className="w-4 h-4" />
          New Role
        </Button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {roles.map((role: any) => {
          const isSystemRole = ['ADMIN', 'LANDLORD', 'USER'].includes(role.name);
          const style = roleColorMap[role.name] || defaultRoleStyle;
          const Icon = style.icon;

          return (
            <motion.div
              key={role.id}
              variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            >
              <Card className="group relative h-full flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-2xl rounded-[2rem]">
                {/* Top accent bar */}
                <div className={cn('absolute top-0 left-0 h-1 w-full opacity-80', style.accent)} />

                <CardHeader className="flex flex-row items-start justify-between pb-4 pt-6 px-6">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-sm', style.bg)}>
                      <Icon className={cn('w-6 h-6', style.color)} />
                    </div>
                    <div>
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-lg font-black tracking-tight text-gray-900 dark:text-white">{role.name}</CardTitle>
                        {isSystemRole && (
                          <Badge variant="outline" className="w-fit text-[9px] font-black uppercase border-gray-200 dark:border-gray-700 h-5 px-2 bg-white/50 dark:bg-gray-800/50 text-gray-500 tracking-widest">
                            System
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                        <IconDotsVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-xl">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Role Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
                      <DropdownMenuItem onClick={() => onEdit(role)} className="text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer gap-2 py-2">
                        <IconEdit className="w-4 h-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(role)}
                        className="text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer gap-2 py-2 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
                      >
                        <IconTrash className="w-4 h-4" /> Delete Role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="flex-1 pb-6 px-6 space-y-5">
                  <p className="text-xs font-bold text-gray-500 leading-relaxed line-clamp-2 min-h-[36px]">
                    {role.description || 'No description defined for this governance role.'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <span className={cn('text-xs font-black tabular-nums', style.color)}>{role.permissions?.length || 0}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Permissions</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-black tabular-nums text-gray-500">{role.users?.length || 0}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Members</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-5 pb-5 px-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/30 dark:bg-gray-900/30">
                  {/* Avatar stack */}
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[9px] font-black text-gray-400 shadow-sm"
                      >
                        U
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm backdrop-blur-sm">
                      +
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(role)}
                    className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 group/btn hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-white"
                  >
                    View Specs
                    <IconChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
