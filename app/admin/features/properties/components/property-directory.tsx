'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
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
import {
  Eye,
  Edit,
  Trash2,
  Building2,
  MapPin,
  TrendingUp,
  Search,
  RefreshCw,
  MoreHorizontal,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useProperties, useDeleteProperty, type Property } from '@/app/admin/hooks/use-properties';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { Input } from "@/app/admin/components/ui/input";

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

export function PropertyDirectory() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');

  const { data, isLoading, isError, error, refetch } = useProperties({
    page,
    search: search || undefined,
    status: status || undefined,
  });

  const { mutate: deleteProperty } = useDeleteProperty();

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action is irreversible.')) {
      deleteProperty(id, {
        onSuccess: () => toast.success('Property deleted successfully'),
        onError: (err: any) => toast.error(`Failed to delete: ${err.message}`),
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Building2 className="w-10 h-10 text-primary animate-pulse" />
        <p className="text-sm text-muted-foreground animate-pulse">Syncing property records...</p>
      </div>
    );
  }

  const properties = data?.data || [];
  const total = data?.meta?.total || 0;
  const activeCount = properties.filter(p => p.status === 'active').length;
  const pendingCount = properties.filter(p => p.status === 'pending').length;
  const avgPrice = total > 0 ? (properties.reduce((sum, p) => sum + p.price, 0) / properties.length) : 0;
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Property Asset Registry</h2>
            <p className="text-muted-foreground">Comprehensive inventory of all platform listings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload
          </Button>
          <Button size="sm">
            Configure Assets
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Units", value: total, desc: "Global inventory", icon: Home },
          { title: "Live Assets", value: activeCount, desc: "Currently active", icon: CheckCircle2 },
          { title: "Approval Desk", value: pendingCount, desc: "Pending review", icon: Clock },
          { title: "Avg Real Estate", value: `$${avgPrice.toFixed(0)}`, desc: "Market average", icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="w-4 h-4 text-primary opacity-70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Asset Inventory</CardTitle>
                <CardDescription>Managed listings and property details</CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search registry..."
                    className="pl-9 w-[250px] h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-1 bg-muted p-1 rounded-md">
                  {[
                    { label: 'All', value: '' },
                    { label: 'Active', value: 'active' },
                    { label: 'Pending', value: 'pending' },
                  ].map((tab) => (
                    <button
                      key={tab.label}
                      onClick={() => setStatus(tab.value)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                        status === tab.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[300px]">Property Details</TableHead>
                  <TableHead>Host Management</TableHead>
                  <TableHead>Asset Type</TableHead>
                  <TableHead>Valuation</TableHead>
                  <TableHead>Operational Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {properties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                        No property assets matched your current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    properties.map((property) => (
                      <motion.tr
                        layout
                        key={property.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{property.title}</span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {property.region || 'Undefined Region'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-sm bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {property.owner?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">{property.owner?.name}</span>
                              <span className="text-[10px] text-muted-foreground">{property.owner?.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal text-[10px] px-1.5 py-0">
                            {property.roomsCount} Rooms
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold text-emerald-600">
                            ${property.price}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-[10px] font-semibold border-solid shadow-none px-2", statusColors[property.status as keyof typeof statusColors])}>
                            {property.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-100 hover:text-amber-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-rose-100 hover:text-rose-600"
                              onClick={() => handleDelete(property.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
