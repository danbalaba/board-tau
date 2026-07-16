import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface IdentityCardProps {
  siteName: string;
  siteDescription: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function IdentityCard({ siteName, siteDescription, onChange }: IdentityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group h-full border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] border border-white/20 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:shadow-primary/10 hover:border-primary/30">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 transition-transform duration-500 group-hover:scale-110">
            <Laptop className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Platform Profile</CardTitle>
            <CardDescription className="text-xs font-medium text-gray-500">Public-facing brand information</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-8 pb-8 px-8">
          <div className="space-y-3">
            <Label htmlFor="siteName" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Platform Name
            </Label>
            <Input
              id="siteName"
              name="siteName"
              placeholder="BoardTAU"
              value={siteName}
              onChange={onChange}
              className="h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl px-4 font-medium transition-all focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="siteDescription" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Platform Description
            </Label>
            <Textarea
              id="siteDescription"
              name="siteDescription"
              placeholder="Short description of the platform"
              value={siteDescription}
              onChange={onChange}
              rows={4}
              className="bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl p-4 font-medium resize-none transition-all focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
