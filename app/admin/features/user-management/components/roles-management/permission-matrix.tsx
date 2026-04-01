'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/admin/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  X, 
  Lock, 
  ShieldAlert 
} from 'lucide-react';
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

  const availableModules = Array.from(new Set(permissions.map((p: any) => p.module))).filter(Boolean) as string[];

  const filteredPermissions = React.useMemo(() => {
    let result = permissions.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = moduleFilter.length === 0 || moduleFilter.includes(p.module);
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
    <Card>
      <div className="h-[400px] animate-pulse bg-muted/20 rounded-xl" />
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>Comprehensive registry of system-wide access controls</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-muted/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(
                    "h-9 gap-2",
                    moduleFilter.length > 0 && "border-primary text-primary bg-primary/5"
                  )}>
                    <Filter className="w-3.5 h-3.5" />
                    Module
                    {moduleFilter.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1 font-bold">
                        {moduleFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Module</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableModules.map((module) => (
                    <DropdownMenuCheckboxItem
                      key={module}
                      checked={moduleFilter.includes(module)}
                      onCheckedChange={(checked: boolean) => {
                        setModuleFilter(prev =>
                          checked ? [...prev, module] : prev.filter(m => m !== module)
                        );
                      }}
                    >
                      {module}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy('module')}>
                    By Module (Default)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name-asc')}>
                    Name A → Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
                    Name Z → A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {(searchTerm || moduleFilter.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearchTerm(''); setModuleFilter([]); }}
                  className="h-9 px-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="py-3 px-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[35%]">Permission</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Description</TableHead>
                <TableHead className="py-3 px-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Assigned Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map((permission: any) => (
                  <TableRow key={permission.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          permission.action === 'create' && "bg-emerald-500",
                          permission.action === 'read' && "bg-blue-500",
                          permission.action === 'update' && "bg-amber-500",
                          permission.action === 'delete' && "bg-rose-500",
                          !['create', 'read', 'update', 'delete'].includes(permission.action) && "bg-slate-400"
                        )} />
                        <div>
                          <p className="font-semibold text-sm font-mono text-foreground">{permission.name}</p>
                          <Badge variant="secondary" className="mt-1 h-4 text-[9px] font-bold uppercase tracking-wide px-1.5">
                            {permission.module}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-muted-foreground max-w-sm">
                      {permission.description || 'No description provided.'}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {roles.filter(r => r.permissions?.includes(permission.name)).map((role) => (
                          <Badge
                            key={role.id}
                            variant={role.name === 'ADMIN' ? 'destructive' : 'secondary'}
                            className="text-[10px] font-bold uppercase tracking-wide h-5 px-2"
                          >
                            {role.name}
                          </Badge>
                        ))}
                        {roles.filter(r => r.permissions?.includes(permission.name)).length === 0 && (
                          <span className="text-[11px] text-muted-foreground italic">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Lock className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No permissions match your filter</p>
                      <p className="text-xs mt-1 opacity-70">Try adjusting your search or module filter</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
