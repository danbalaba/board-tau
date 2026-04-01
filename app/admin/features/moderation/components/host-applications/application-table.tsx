// app/admin/features/moderation/components/host-applications/application-table.tsx
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Eye, CheckCircle, XCircle, FileText, Calendar, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HostApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  motivation: string;
  documentsVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface ApplicationTableProps {
  applications: HostApplication[];
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApplicationTable({ applications, onView, onApprove, onReject }: ApplicationTableProps) {
  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
  };

  return (
    <div className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6 px-6">Applicant</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6">Experience</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6">Docs</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6">Status</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6">Submitted</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-6 text-right pr-6">Management</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app, index) => (
            <motion.tr
              key={app.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group border-b border-border/40 hover:bg-primary/[0.02] transition-all cursor-default"
            >
              <TableCell className="py-5 px-6">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm tracking-tight">{app.name}</span>
                  <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground/60 uppercase">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="py-5">
                <div className="flex flex-col gap-1 max-w-[200px]">
                  <span className="text-xs font-medium line-clamp-1">{app.experience}</span>
                  <span className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider italic">Professional Background</span>
                </div>
              </TableCell>

              <TableCell className="py-5">
                <Badge variant="outline" className={cn(
                  "rounded-lg text-[10px] font-black uppercase tracking-widest border-2",
                  app.documentsVerified ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-muted/50 text-muted-foreground/60 border-muted"
                )}>
                  {app.documentsVerified ? "Verified" : "Missing"}
                </Badge>
              </TableCell>

              <TableCell className="py-5">
                <Badge variant="outline" className={cn(
                  "rounded-lg text-[10px] font-black uppercase tracking-widest border-2 px-3",
                  statusColors[app.status]
                )}>
                  {app.status}
                </Badge>
              </TableCell>

              <TableCell className="py-5">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/70">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {new Date(app.submittedAt).toLocaleDateString()}
                </div>
              </TableCell>

              <TableCell className="py-5 pr-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onView(app.id)}
                    className="h-9 w-9 rounded-xl border-border/60 bg-background/50 hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  
                  {app.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onApprove(app.id)}
                        className="h-9 w-9 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-500/5"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onReject(app.id)}
                        className="h-9 w-9 rounded-xl border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-rose-500/5"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
