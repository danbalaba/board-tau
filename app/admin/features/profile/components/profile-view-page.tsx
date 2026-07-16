import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Button } from '@/app/admin/components/ui/button';
import { IconUserCircle, IconCircleCheck } from '@tabler/icons-react';

export default function ProfileViewPage() {
  return (
    <div className='flex w-full flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto'>
      <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconUserCircle className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-xl">My Profile</CardTitle>
            <CardDescription>Manage your personal account settings and identity</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
            <Input
              id="fullName"
              placeholder="e.g. John Doe"
              defaultValue="Admin User"
              className="h-11 bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@boardtau.com"
              defaultValue="admin@boardtau.com"
              className="h-11 bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Role</Label>
            <Input
              id="role"
              value="Super Admin"
              disabled
              className="h-11 bg-white/5 border-white/10 opacity-70"
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button className="h-11 px-8 gap-2 font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              <IconCircleCheck className="h-5 w-5" />
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
