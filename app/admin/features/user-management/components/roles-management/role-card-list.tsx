import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { 
  Plus, 
  ShieldCheck, 
  Users, 
  ChevronRight, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Settings,
  ShieldAlert
} from 'lucide-react';
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

export function RoleCardList({ roles, loading, onEdit, onDelete, onCreate }: RoleCardListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-[200px] bg-muted rounded-xl" />)}
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {roles.map((role: any) => {
        const isSystemRole = role.name === 'ADMIN' || role.name === 'LANDLORD' || role.name === 'USER';
        
        return (
          <motion.div key={role.id} variants={itemVariants}>
            <Card className="group h-full flex flex-col hover:shadow-md transition-all border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  role.name === 'ADMIN' ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                )}>
                  {role.name === 'ADMIN' ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Role Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(role)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(role)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Role
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold">{role.name}</CardTitle>
                    {isSystemRole && (
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wide px-1.5 h-4">
                        System
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {role.description || 'No description provided for this role.'}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px] font-medium bg-muted/50 border-input">
                    {role.permissions?.length || 0} permissions
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium bg-muted/50 border-input">
                    {role.users?.length || 0} active users
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold"
                    >
                      U
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                    +
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onEdit(role)} className="h-8 text-xs gap-1 group">
                  View Specs
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
