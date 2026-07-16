import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Mail, Phone, MapPin, Contact } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ContactCardProps {
  contactEmail: string;
  contactPhone: string;
  address: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ContactCard({ contactEmail, contactPhone, address, onChange }: ContactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="group h-full border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] border border-white/20 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:shadow-blue-500/10 hover:border-blue-500/30">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 shrink-0 transition-transform duration-500 group-hover:scale-110">
            <Contact className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Support Contact Info</CardTitle>
            <CardDescription className="text-xs font-medium text-gray-500">Where users can reach you for help</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-8 pb-8 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="contactEmail" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <Mail className="w-3.5 h-3.5" />
                Support Email
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="ops@boardtau.com"
                value={contactEmail}
                onChange={onChange}
                className="h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl px-4 font-medium transition-all focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="contactPhone" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <Phone className="w-3.5 h-3.5" />
                Phone Number
              </Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={contactPhone}
                onChange={onChange}
                className="h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl px-4 font-medium transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="address" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              Address
            </Label>
            <Input
              id="address"
              name="address"
              placeholder="123 BoardTAU St, City, Country"
              value={address}
              onChange={onChange}
              className="h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl px-4 font-medium transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
