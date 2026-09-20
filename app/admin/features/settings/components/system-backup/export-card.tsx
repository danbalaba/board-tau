import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Download, HardDriveDownload, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/app/admin/components/ui/checkbox';

export const SCOPE_TABLES = {
  all: [],
  taxonomy: [
    { id: 'propertyTypes', label: 'Property Types (Categories)' },
    { id: 'roomTypeDefinitions', label: 'Room Setups & Definitions' },
    { id: 'bedSetupDefinitions', label: 'Bed Setup Configurations' },
    { id: 'campusColleges', label: 'Campus Colleges & Coordinates' },
    { id: 'attributeSubGroups', label: 'Attribute Categories & Subgroups' },
    { id: 'dynamicAttributes', label: 'Dynamic Attributes & Badges' }
  ],
  users: [
    { id: 'users', label: 'User Profiles & Credentials' },
    { id: 'userRoles', label: 'User Roles & RBAC' },
    { id: 'permissions', label: 'Role Permissions' },
    { id: 'accounts', label: 'OAuth Auth Accounts' },
    { id: 'hostApplications', label: 'Landlord Verification Apps' },
    { id: 'emailOTPs', label: 'Email Security OTPs' },
    { id: 'userStrikes', label: 'User Ban & Strike Logs' },
    { id: 'customDashboards', label: 'Custom Admin Dashboards' }
  ],
  listings: [
    { id: 'listings', label: 'Property Listings' },
    { id: 'rooms', label: 'Listing Rooms' },
    { id: 'listingImages', label: 'Listing Gallery Photos' },
    { id: 'roomImages', label: 'Room Gallery Photos' },
    { id: 'listingAttributeLinks', label: 'Listing Attribute Links' },
    { id: 'roomAttributeLinks', label: 'Room Attribute Links' }
  ],
  reservations: [
    { id: 'inquiries', label: 'Tenant Inquiries' },
    { id: 'reservations', label: 'Reservations & Bookings' },
    { id: 'leaseContracts', label: 'Digital Lease Contracts' },
    { id: 'contractSignatures', label: 'Digital Contract Signatures' }
  ],
  messages: [
    { id: 'messages', label: 'Direct User Messages' },
    { id: 'reviews', label: 'Property Ratings & Reviews' },
    { id: 'notifications', label: 'In-App User Notifications' }
  ],
  logs: [
    { id: 'adminActivityLogs', label: 'Admin Audit Activity Logs' },
    { id: 'moderationLogs', label: 'Content Moderation Logs' },
    { id: 'siteSettings', label: 'Site Configuration & Auto-Backup' },
    { id: 'featureFlags', label: 'System Feature Flags' },
    { id: 'platformMetricSnapshots', label: 'Platform Metric Snapshots' },
    { id: 'passwordResetTokens', label: 'Password Reset Tokens' }
  ]
};

interface ExportCardProps {
  backupScope: string;
  setBackupScope: (val: string) => void;
  onExport: (selectedTables: string[]) => void;
  exporting: boolean;
}

export function ExportCard({ backupScope, setBackupScope, onExport, exporting }: ExportCardProps) {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  // Derived: is the Download button allowed to fire?
  const canDownload =
    !exporting &&
    backupScope !== '' &&
    (backupScope === 'all' || selectedTables.length > 0);

  useEffect(() => {
    // Always reset to empty when switching scope — user can manually pick which collections to include
    setSelectedTables([]);
  }, [backupScope]);

  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="group h-full border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] border border-white/20 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:shadow-emerald-500/10 hover:border-emerald-500/30">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800/50 bg-emerald-50/30 dark:bg-emerald-900/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0 transition-transform duration-500 group-hover:scale-110">
            <HardDriveDownload className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
              Download System Backup
            </CardTitle>
            <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Save an encrypted JSON snapshot of your database to your local computer.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-8 pb-8 px-8 flex flex-col justify-between h-[calc(100%-88px)]">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Generate a standardized JSON snapshot of the system state. You can restrict the scope of the export to specific collections or perform a full system dump.
          </p>
          
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              What to Download
            </label>
            <div className="flex gap-4">
              <Select value={backupScope} onValueChange={(val) => { setBackupScope(val); setSelectedTables([]); }}>
                <SelectTrigger className="h-12 w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all focus:ring-2 focus:ring-emerald-500/20">
                  <SelectValue placeholder="— Select a collection to backup —" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-xl">
                  <SelectItem value="all" className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        Full Database Dump (All 33 Models)
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 normal-case tracking-normal">
                        Export complete dynamic taxonomy, users, listings, contracts, & system logs
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="taxonomy" className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        Dynamic Taxonomy & Config
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 normal-case tracking-normal">
                        PropertyTypes, RoomTypeDefinitions, BedSetups, CampusColleges, Attributes
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="users" className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        User & Access Control Data
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 normal-case tracking-normal">
                        User, Account, HostApplication, EmailOTP, UserRoles, Permissions, Strikes
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="listings" className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        Property Inventory Data
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 normal-case tracking-normal">
                        Listing, Room, ListingImage, RoomImage, Attribute Links
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="reservations" className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        Bookings & Digital Leases
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 normal-case tracking-normal">
                        Reservation, Inquiry, LeaseContract, ContractSignature
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="messages" className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        Social & Communications
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 normal-case tracking-normal">
                        Message, Review, Notification
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="logs" className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        System & Security Logs
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 normal-case tracking-normal">
                        AdminActivityLog, ModerationLog, SiteSettings, FeatureFlag, MetricSnapshot
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <AnimatePresence>
              {backupScope !== 'all' && backupScope !== '' && SCOPE_TABLES[backupScope as keyof typeof SCOPE_TABLES]?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Select Specific Collections
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedTables.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {SCOPE_TABLES[backupScope as keyof typeof SCOPE_TABLES].map((table) => (
                      <div key={table.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`table-${table.id}`} 
                          checked={selectedTables.includes(table.id)}
                          onCheckedChange={() => handleTableToggle(table.id)}
                          className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                        <label 
                          htmlFor={`table-${table.id}`} 
                          className="text-xs font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {table.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="button" 
              onClick={() => onExport(selectedTables)} 
              disabled={!canDownload}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl gap-2 transition-all shadow-lg hover:shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-emerald-600"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? 'Generating Snapshot...' : 'Download Backup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
