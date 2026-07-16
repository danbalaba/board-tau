import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { History, Loader2, DownloadCloud, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileJson, Clock, User, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/app/admin/components/ui/sonner';

export function BackupHistoryCard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  
  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filterRange, setFilterRange] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/backup/logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
    
    // Listen for custom event to refresh logs
    const handleRefresh = () => fetchLogs();
    window.addEventListener('refreshBackupLogs', handleRefresh);
    return () => window.removeEventListener('refreshBackupLogs', handleRefresh);
  }, []);

  // Filter logs based on selected date range
  const filteredLogs = useMemo(() => {
    if (filterRange === 'all') return logs;
    
    const now = new Date();
    const cutoff = new Date();
    
    if (filterRange === '24h') cutoff.setHours(now.getHours() - 24);
    if (filterRange === '7d') cutoff.setDate(now.getDate() - 7);
    if (filterRange === '30d') cutoff.setDate(now.getDate() - 30);
    
    return logs.filter(log => new Date(log.createdAt) >= cutoff);
  }, [logs, filterRange]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRange, pageSize]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  
  // Prevent out of bounds page
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      const middle = Math.ceil(maxVisiblePages / 2);
      if (currentPage <= middle) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - middle + 1) {
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        startPage = currentPage - middle + 1;
        endPage = currentPage + middle - 1;
      }
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };
  const pageNumbers = getPageNumbers();

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'AUTOMATED_SYSTEM_BACKUP':
        return <Clock className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'SYSTEM_BACKUP_DOWNLOAD':
        return <User className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'PRE_RESTORE_SAFETY_SNAPSHOT':
        return <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <History className="h-4 w-4 text-gray-400 shrink-0" />;
    }
  };

  const getLogLabel = (action: string, filename?: string) => {
    if (action === 'PRE_RESTORE_SAFETY_SNAPSHOT') return 'Safety Snapshot (Pre-Restore)';
    if (action === 'SYSTEM_BACKUP_DOWNLOAD') {
      if (filename?.includes('manual_users')) return 'Manual Backup (Users)';
      if (filename?.includes('manual_listings')) return 'Manual Backup (Listings)';
      if (filename?.includes('manual_reservations')) return 'Manual Backup (Reservations)';
      if (filename?.includes('manual_messages')) return 'Manual Backup (Messages)';
      if (filename?.includes('manual_logs')) return 'Manual Backup (Logs)';
      return 'Manual Backup (Full)';
    }
    return 'Automated Backup';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
      <Card className="group h-full border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-500">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-500/10 text-gray-600 dark:text-gray-400 shrink-0">
              <History className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Backup History</CardTitle>
              <CardDescription className="text-xs font-medium text-gray-500">A unified log of all system backups and snapshots.</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center">
            <Select value={filterRange} onValueChange={setFilterRange}>
              <SelectTrigger className="h-9 w-[180px] text-xs font-bold">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all" className="text-xs font-bold">All Time</SelectItem>
                <SelectItem value="24h" className="text-xs font-bold">Last 24 Hours</SelectItem>
                <SelectItem value="7d" className="text-xs font-bold">Last 7 Days</SelectItem>
                <SelectItem value="30d" className="text-xs font-bold">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 h-full flex flex-col min-h-[400px]">
          <div className="flex-1 space-y-4">
            {loadingLogs ? (
              <div className="flex items-center justify-center h-full gap-2 text-gray-400 min-h-[250px]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Loading history...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-60 min-h-[250px]">
                <FileJson className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No backups found for this range.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between gap-6">
                <div className="space-y-4">
                  {paginatedLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 items-center group relative p-4 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm">
                      {getLogIcon(log.action)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {getLogLabel(log.action, log.filename)}
                        </p>
                        <p className="text-xs font-medium text-gray-500 mt-1 truncate">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                      
                      {log.url && (
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/admin/backup/download?url=${encodeURIComponent(log.url)}`);
                            if (!res.ok) {
                              toast.error('Failed to prepare download');
                              return;
                            }
                            const blob = await res.blob();
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = log.filename || 'backup.json';
                            a.click();
                            URL.revokeObjectURL(a.href);
                          }}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-600 shrink-0"
                          title="Download backup file"
                        >
                          <DownloadCloud className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Advanced Pagination Footer matching data-table */}
                <div className="flex w-full flex-col-reverse items-center justify-between gap-4 sm:flex-row pt-6 mt-auto border-t border-gray-100 dark:border-gray-800/50">
                  <div className="text-muted-foreground flex-1 text-sm whitespace-nowrap">
                    {filteredLogs.length} total backup(s)
                  </div>
                  <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
                      <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => setPageSize(Number(value))}
                      >
                        <SelectTrigger className="h-8 w-[80px]">
                          <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[5, 10, 20, 50].map((size) => (
                            <SelectItem key={size} value={`${size}`} className="text-sm font-medium">
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-center text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        aria-label="Go to first page"
                        variant="outline"
                        size="icon"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Go to previous page"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {pageNumbers.map((pageNumber) => (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? 'default' : 'outline'}
                          size="icon"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      ))}

                      {pageNumbers.length < totalPages && (
                        <span className="px-2 text-sm text-muted-foreground">...</span>
                      )}

                      <Button
                        aria-label="Go to next page"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Go to last page"
                        variant="outline"
                        size="icon"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
