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
const defaultRoleStyle = { icon: IconSettings, color: 'text-primary', bg: 'bg-primary/10', accent: 'bg-primary' };

export function RoleCardList({ roles, loading, onEdit, onDelete, onCreate }: RoleCardListProps) {
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-52 bg-muted/20 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-0.5 bg-blue-500 rounded-full" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/70">
            Active Role Registry · {roles.length} Governance Groups
          </h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onCreate}
          className="h-8 gap-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 border-border/40"
        >
          <IconPlus className="w-3.5 h-3.5" />
          New Role
        </Button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {roles.map((role: any) => {
          const isSystemRole = ['ADMIN', 'LANDLORD', 'USER'].includes(role.name);
          const style = roleColorMap[role.name] || defaultRoleStyle;
          const Icon = style.icon;

          return (
            <motion.div
              key={role.id}
              variants={{ hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            >
              <Card className="group relative h-full flex flex-col overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40 hover:shadow-2xl">
                {/* Top accent bar */}
                <div className={cn('absolute top-0 left-0 h-0.5 w-full opacity-60', style.accent)} />

                <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-xl transition-transform group-hover:scale-110', style.bg)}>
                      <Icon className={cn('w-5 h-5', style.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-black tracking-tight">{role.name}</CardTitle>
                        {isSystemRole && (
                          <Badge variant="outline" className="text-[9px] font-black uppercase border-none h-4 px-1.5 bg-white/5 text-muted-foreground/60">
                            System
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                        <IconDotsVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/40 rounded-2xl p-2">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 px-2">Role Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem onClick={() => onEdit(role)} className="text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer gap-2">
                        <IconEdit className="w-4 h-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(role)}
                        className="text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10"
                      >
                        <IconTrash className="w-4 h-4" /> Delete Role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="flex-1 pb-4 space-y-4">
                  <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 min-h-[36px]">
                    {role.description || 'No description defined for this governance role.'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                      <span className={cn('text-[10px] font-black tabular-nums', style.color)}>{role.permissions?.length || 0}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Permissions</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] font-black tabular-nums text-muted-foreground">{role.users?.length || 0}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Members</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-white/5 flex items-center justify-between">
                  {/* Avatar stack */}
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-background bg-muted/40 flex items-center justify-center text-[8px] font-black text-muted-foreground/60"
                      >
                        U
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-white/5 flex items-center justify-center text-[8px] font-black text-muted-foreground/40">
                      +
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(role)}
                    className="h-8 text-[10px] font-black uppercase tracking-widest gap-1.5 group/btn hover:bg-white/5"
                  >
                    View Specs
                    <IconChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
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
