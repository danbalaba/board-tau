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
import { Shield, Info, Loader2 } from 'lucide-react';
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
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        permissions: initialData.permissions || []
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

  const modules = Array.from(new Set(permissions.map((p: any) => p.module)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            </div>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Role Name</Label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="e.g. MODERATOR"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-muted/30 focus-visible:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Input 
                  id="description"
                  name="description"
                  placeholder="What this role is responsible for..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-muted/30 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Permissions Matrix</Label>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {formData.permissions.length} selected
                </Badge>
              </div>
              
              <ScrollArea className="h-[300px] w-full rounded-md border border-input bg-muted/20 p-4">
                {permissionsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {modules.map((module: any) => (
                      <div key={module} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 flex-1">
                            {module} Operations
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {permissions.filter((p: any) => p.module === module).map((permission: any) => {
                            const isSelected = formData.permissions.includes(permission.name);
                            return (
                              <div 
                                key={permission.id}
                                onClick={() => togglePermission(permission.name)}
                                className={cn(
                                  "flex items-center space-x-3 space-y-0 rounded-lg border p-3 cursor-pointer transition-colors",
                                  isSelected ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-card hover:bg-muted/50"
                                )}
                              >
                                <Checkbox 
                                  checked={isSelected}
                                  onCheckedChange={() => togglePermission(permission.name)}
                                />
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold leading-none">{permission.name}</p>
                                  {permission.description && (
                                    <p className="text-[10px] text-muted-foreground font-medium">
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
              <div className="flex items-start gap-2 text-[10px] text-muted-foreground mt-2">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                <span>Selected permissions will be applied immediately upon role update. Please ensure proper security auditing.</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="min-w-[120px]">
              {initialData ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
