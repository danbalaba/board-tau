import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/admin/components/ui/dialog';
import { Button } from '@/app/admin/components/ui/button';
import { AlertTriangle, UploadCloud, Loader2, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from '@/app/admin/components/ui/sonner';

interface RestoreWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
}

export function RestoreWarningModal({ isOpen, onClose, onConfirm }: RestoreWarningModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // State for the verification step
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    newRecordsFound: number;
    stats: { users: number; reservations: number; listings: number };
  } | null>(null);

  const handleClose = () => {
    setSelectedFile(null);
    setVerificationResult(null);
    onClose();
  };

  const processFile = async (file: File) => {
    if (!file) return;

    // 1. Strict File Type Validation (.json)
    if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
      toast.error('Invalid file format. Please upload a valid .json backup file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Reasonable File Size Limit (e.g., 50MB max)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed is 50MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setVerifying(true);

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const res = await fetch('/api/admin/restore?action=verify', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify backup file');
      }

      setVerificationResult(data);
    } catch (error: any) {
      toast.error(error.message);
      setSelectedFile(null);
    } finally {
      setVerifying(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFinalConfirm = () => {
    if (selectedFile) {
      onConfirm(selectedFile);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-rose-200 dark:border-rose-900/50 rounded-[2rem] shadow-2xl">
            
            {!selectedFile ? (
              // STEP 1: UPLOAD FILE
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader className="p-6 pb-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Restore System</DialogTitle>
                      <DialogDescription className="text-xs font-medium text-rose-500 mt-1">This will overwrite current data.</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="p-6 pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6">
                    You are about to upload a JSON dump to overwrite the production database. 
                    <br/><br/>
                    Before proceeding, we will verify the backup and automatically take a <strong className="text-amber-500">safety snapshot</strong> of the current database.
                  </p>

                  <div 
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                      isDragging 
                        ? 'border-rose-400 bg-rose-50/80 dark:border-rose-500 dark:bg-rose-900/30' 
                        : 'border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/10'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <UploadCloud className={`h-10 w-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-rose-500' : 'text-rose-400'}`} />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {isDragging ? 'Drop backup JSON here' : 'Click or drag to browse for backup JSON'}
                    </p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Only .json files are accepted (Max 50MB)</p>
                  </div>
                  <input
                    type="file"
                    accept=".json,application/json"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                
                <DialogFooter className="p-6 pt-0 sm:justify-end gap-3">
                  <Button variant="ghost" onClick={handleClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white">
                    Cancel
                  </Button>
                </DialogFooter>
              </motion.div>
            ) : verifying ? (
              // VERIFICATION LOADING STATE
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-10 w-10 text-rose-500 animate-spin mb-4" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Analyzing Backup File...</h3>
                <p className="text-sm text-gray-500 font-medium">Checking for data gaps and validating integrity.</p>
              </motion.div>
            ) : verificationResult ? (
              // STEP 2: VERIFICATION RESULTS & FINAL CONFIRMATION
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <DialogHeader className="p-6 pb-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${verificationResult.newRecordsFound > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {verificationResult.newRecordsFound > 0 ? <AlertTriangle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                        {verificationResult.newRecordsFound > 0 ? 'Warning: New Data Detected' : 'Ready to Restore'}
                      </DialogTitle>
                      <DialogDescription className={`text-xs font-medium mt-1 ${verificationResult.newRecordsFound > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {verificationResult.newRecordsFound > 0 ? 'You will lose recent records if you proceed.' : 'No conflicts detected with current database.'}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="p-6 pt-2">
                  {verificationResult.newRecordsFound > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 mb-6">
                      <p className="text-sm text-amber-800 dark:text-amber-400 font-medium mb-3">
                        Since this backup was created, the following new records have been added to the system:
                      </p>
                      <ul className="space-y-2">
                        {verificationResult.stats.users > 0 && (
                          <li className="flex items-center justify-between text-sm">
                            <span className="text-amber-700/70 dark:text-amber-500/70">New Users</span>
                            <span className="font-bold text-amber-900 dark:text-amber-300">+{verificationResult.stats.users}</span>
                          </li>
                        )}
                        {verificationResult.stats.reservations > 0 && (
                          <li className="flex items-center justify-between text-sm">
                            <span className="text-amber-700/70 dark:text-amber-500/70">New Reservations</span>
                            <span className="font-bold text-amber-900 dark:text-amber-300">+{verificationResult.stats.reservations}</span>
                          </li>
                        )}
                        {verificationResult.stats.listings > 0 && (
                          <li className="flex items-center justify-between text-sm">
                            <span className="text-amber-700/70 dark:text-amber-500/70">New Listings</span>
                            <span className="font-bold text-amber-900 dark:text-amber-300">+{verificationResult.stats.listings}</span>
                          </li>
                        )}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-900/30">
                        <p className="text-xs text-amber-800 dark:text-amber-400 font-bold uppercase tracking-widest">
                          Total New Records: {verificationResult.newRecordsFound}
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    A safety snapshot will be generated automatically before the restore begins. 
                    {verificationResult.newRecordsFound > 0 ? ' Are you absolutely sure you want to overwrite the database and ignore the recent changes?' : ' You may safely proceed with the restoration.'}
                  </p>
                </div>
                
                <DialogFooter className="p-6 pt-0 sm:justify-end gap-3 flex-col sm:flex-row">
                  <Button variant="ghost" onClick={handleClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-100">
                    Cancel Restore
                  </Button>
                  <Button 
                    onClick={handleFinalConfirm} 
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-rose-600/30"
                  >
                    Proceed with Restore
                  </Button>
                </DialogFooter>
              </motion.div>
            ) : null}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
