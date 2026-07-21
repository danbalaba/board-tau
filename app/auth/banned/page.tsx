"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconBan, IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import Button from "@/components/common/Button";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";
import toast from "react-hot-toast";

const AccountBannedPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) return;
    
    const channelName = `user-status-${email}`;
    pusherClient.subscribe(channelName);
    
    pusherClient.bind('account-restored', (data: any) => {
      if (data.status === 'active') {
        toast.success("Account Restored! Redirecting to login...", {
          duration: 4000,
          position: 'top-center'
        });
        
        // Wait briefly for the user to read the toast, then redirect to login modal
        setTimeout(() => {
          router.push("/?auth=login");
        }, 2000);
      }
    });

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind('account-restored');
    };
  }, [email, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-rose-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/20 dark:border-gray-800/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-tr from-red-600 to-rose-700 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-red-600/40 mb-10 relative group"
          >
            <div className="absolute inset-0 bg-red-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <IconBan size={44} className="text-white relative z-10" strokeWidth={2.5} />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              Account <span className="text-red-600">Banned</span>
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
              This account has been permanently restricted from accessing BoardTAU due to severe or repeated violations of our Terms of Service.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 gap-4 mb-10 text-left"
          >
            <div className="p-5 bg-white/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-4">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                <IconAlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">Status</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">Permanently Banned</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-4"
          >
            <Link href="/" className="w-full">
              <button className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800">
                <IconArrowLeft size={16} />
                Return to Homepage
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer info */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest"
        >
          BoardTAU Security Protocol
        </motion.p>
      </div>
    </div>
  );
};

export default AccountBannedPage;
