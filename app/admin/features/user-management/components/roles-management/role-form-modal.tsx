import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/app/admin/components/ui/dialog';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Checkbox } from '@/app/admin/components/ui/checkbox';
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';
import { Badge } from '@/app/admin/components/ui/badge';
import { Separator } from '@/app/admin/components/ui/separator';
import { usePermissions } from '@/app/admin/hooks/use-roles';
import { IconShield, IconInfoCircle, IconLoader2 } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  title: string;
  description: string;
}

export function RoleFormModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  title,
  description 
}: RoleFormModalProps) {
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions();
  const permissions = permissionsData?.data || [];
  
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  React.useEffect(() => {
    if (!open) return;

    if (initialData) {
      setFormData(prev => {
        if (prev.name === initialData.name && 
            JSON.stringify(prev.permissions) === JSON.stringify(initialData.permissions || [])) {
          return prev;
        }
        return {
          name: initialData.name,
          description: initialData.description || '',
          permissions: initialData.permissions || []
        };
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const togglePermission = (permName: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter(p => p !== permName)
        : [...prev.permissions, permName]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const modules = React.useMemo(() => 
    Array.from(new Set(permissions.map((p: any) => p.module))),
    [permissions]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-500/10 rounded-2xl shadow-sm">
                <IconShield className="w-6 h-6 text-emerald-500" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{title}</DialogTitle>
            </div>
            <DialogDescription className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-[3.25rem]">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Role Name</Label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="e.g. MODERATOR"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus-visible:ring-emerald-500/20 text-sm font-bold shadow-sm"
                  required
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Description</Label>
                <Input 
                  id="description"
                  name="description"
                  placeholder="What this role is responsible for..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="h-12 rounded-2xl bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus-visible:ring-emerald-500/20 text-sm font-bold shadow-sm"
                />
              </div>
            </div>

            <Separator className="bg-gray-100 dark:bg-gray-800 my-2" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Permissions Matrix</Label>
                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest h-6 px-3 bg-emerald-500/10 text-emerald-500 border-none rounded-lg">
                  {formData.permissions.length} selected
                </Badge>
              </div>
              
              <ScrollArea className="h-[300px] w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-800/40 p-5 shadow-inner">
                {permissionsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <IconLoader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {modules.map((module: any) => (
                      <div key={module} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2 flex-1">
                            {module} Operations
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          {permissions.filter((p: any) => p.module === module).map((permission: any) => {
                            const isSelected = formData.permissions.includes(permission.name);
                            return (
                              <div 
                                key={permission.id}
                                onClick={() => togglePermission(permission.name)}
                                className={cn(
                                  "flex items-center space-x-4 space-y-0 rounded-2xl border p-4 cursor-pointer transition-all duration-300",
                                  isSelected ? "bg-emerald-500/5 border-emerald-500/30 shadow-md shadow-emerald-500/5" : "bg-white/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
                                )}
                              >
                                <Checkbox 
                                  checked={isSelected}
                                  onCheckedChange={() => togglePermission(permission.name)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={cn("rounded-md border-gray-300 dark:border-gray-600", isSelected && "border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white")}
                                />
                                <div className="space-y-1.5">
                                  <p className={cn("text-xs font-black tracking-tight", isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>{permission.name}</p>
                                  {permission.description && (
                                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="flex items-start gap-2 text-[10px] text-emerald-600/80 dark:text-emerald-400/80 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 mt-4">
                <IconInfoCircle className="w-4 h-4 shrink-0" />
                <span className="font-bold leading-relaxed tracking-widest uppercase">Selected permissions will be applied immediately upon role update. Please ensure proper security auditing.</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-8">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} className="rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="min-w-[120px] rounded-xl bg-gray-900 hover:bg-emerald-500 dark:bg-white dark:text-gray-900 dark:hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all">
              {initialData ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
