'use client';

import React from 'react';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/app/admin/components/ui/table';
import { 
  IconSearch, 
  IconFilter, 
  IconArrowsSort, 
  IconX, 
  IconLock, 
  IconShieldExclamation 
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/app/admin/components/ui/dropdown-menu';

interface PermissionMatrixProps {
  permissions: any[];
  roles: any[];
  loading: boolean;
}

export function PermissionMatrix({ permissions, roles, loading }: PermissionMatrixProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [moduleFilter, setModuleFilter] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<string>('module');

  const getModuleColor = (module: string) => {
    switch (module?.toUpperCase()) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'LANDLORD': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'USER': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const availableModules = Array.from(new Set(permissions.map((p: any) => p.module?.toUpperCase()))).filter(Boolean) as string[];

  const formatModuleName = (mod: string) => {
    if (mod === 'ADMIN') return 'SYSTEM ADMIN';
    return mod;
  };

  const filteredPermissions = React.useMemo(() => {
    let result = permissions.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = moduleFilter.length === 0 || moduleFilter.includes(p.module?.toUpperCase());
      return matchesSearch && matchesModule;
    });

    return [...result].sort((a: any, b: any) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'module') return a.module.localeCompare(b.module) || a.name.localeCompare(b.name);
      return 0;
    });
  }, [permissions, searchTerm, moduleFilter, sortBy]);

  if (loading) return (
    <div className="rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg h-[400px] animate-pulse" />
  );

  return (
    <div className="rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <IconShieldExclamation className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Permissions</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 mb-3">View and manage all available permissions in the system</p>
            
            <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" /> Create</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]" /> Read</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]" /> Update</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]" /> Delete</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Other</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus-visible:ring-blue-500/20 text-sm font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={cn(
                  "h-12 px-4 gap-2 rounded-2xl border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest",
                  moduleFilter.length > 0 && "border-blue-500/30 text-blue-500 bg-blue-500/5"
                )}>
                  <IconFilter className="w-4 h-4" />
                  Module
                  {moduleFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 text-[9px] px-1.5 font-black bg-blue-500/20 text-blue-600 rounded-lg">
                      {moduleFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 p-2 shadow-xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Filter by Module</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-2" />
                {availableModules.map((module) => (
                  <DropdownMenuCheckboxItem
                    key={module}
                    checked={moduleFilter.includes(module)}
                    onCheckedChange={(checked: boolean) => {
                      setModuleFilter(prev =>
                        checked ? [...prev, module] : prev.filter(m => m !== module)
                      );
                    }}
                    className="text-xs font-bold rounded-xl"
                  >
                    {formatModuleName(module)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-4 gap-2 rounded-2xl border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest">
                  <IconArrowsSort className="w-4 h-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 p-2 shadow-xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Sort Order</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-2" />
                <DropdownMenuItem onClick={() => setSortBy('module')} className="text-xs font-bold rounded-xl">
                  By Module (Default)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name-asc')} className="text-xs font-bold rounded-xl">
                  Name A → Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name-desc')} className="text-xs font-bold rounded-xl">
                  Name Z → A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {(searchTerm || moduleFilter.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => { setSearchTerm(''); setModuleFilter([]); }}
                className="h-12 px-4 gap-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <IconX className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="bg-gray-50/80 dark:bg-gray-800/50 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                <TableHead className="py-4 px-6 font-black text-[10px] uppercase tracking-widest text-gray-500 w-[35%] h-auto">Permission</TableHead>
                <TableHead className="py-4 px-4 font-black text-[10px] uppercase tracking-widest text-gray-500 h-auto">Description</TableHead>
                <TableHead className="py-4 px-6 font-black text-[10px] uppercase tracking-widest text-gray-500 text-right h-auto">Assigned Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map((permission: any) => (
                  <TableRow key={permission.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors border-gray-100 dark:border-gray-800">
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0 shadow-sm",
                          permission.action === 'create' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                          permission.action === 'read' && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
                          permission.action === 'update' && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                          permission.action === 'delete' && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                          !['create', 'read', 'update', 'delete'].includes(permission.action) && "bg-gray-400"
                        )} />
                        <div>
                          <p className="font-black text-sm text-gray-900 dark:text-white">{permission.name}</p>
                          <Badge variant="outline" className={cn("mt-1.5 h-5 text-[9px] font-black uppercase tracking-widest px-2 border", getModuleColor(permission.module))}>
                            {formatModuleName(permission.module?.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-4 text-xs font-bold text-gray-500 max-w-sm leading-relaxed">
                      {permission.description || 'No description provided.'}
                    </TableCell>
                    <TableCell className="py-5 px-6 text-right">
                      <div className="flex flex-wrap gap-2 justify-end">
                        {roles.filter(r => r.permissions?.includes(permission.name)).map((role) => (
                          <Badge
                            key={role.id}
                            variant={role.name === 'ADMIN' ? 'destructive' : 'secondary'}
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest h-6 px-2.5 rounded-lg border-none",
                              role.name === 'ADMIN' ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
                            )}
                          >
                            {role.name}
                          </Badge>
                        ))}
                        {roles.filter(r => r.permissions?.includes(permission.name)).length === 0 && (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <IconLock className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">No permissions match</p>
                      <p className="text-xs mt-2 font-bold opacity-70">Try adjusting your search or module filter</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
