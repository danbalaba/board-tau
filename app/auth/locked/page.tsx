"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconLock, IconMail, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import Button from "@/components/common/Button";
import { useSearchParams, useRouter } from "next/navigation";

const AccountLockedPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  // The email might be missing if redirected from OAuth middleware
  const displayEmail = email || "Your Account";

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/20 dark:border-gray-800/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center"
        >
          {/* Padlock Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-tr from-rose-500 to-rose-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-rose-500/40 mb-10 relative group"
          >
            <div className="absolute inset-0 bg-rose-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <IconLock size={44} className="text-white relative z-10" strokeWidth={2.5} />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              Account <span className="text-rose-500">Locked</span>
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
              For your security, we've temporarily suspended access to this account due to multiple failed verification attempts.
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
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                <IconLock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">Duration</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">24-Hour Security Lockout</p>
              </div>
            </div>

            <div className="p-5 bg-white/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-4">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <IconMail size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">Assistance</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">Contact <span className="text-amber-500 underline underline-offset-4 cursor-pointer hover:text-amber-400 transition-colors">support@boardtau.com</span></p>
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
            <Link href="mailto:support@boardtau.com" className="w-full">
              <Button className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20">
                Contact Support
              </Button>
            </Link>
            
            <Link href="/" className="w-full">
              <button className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center gap-2">
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
          Protected by BoardTAU Security Protocol v2.0
        </motion.p>
      </div>
    </div>
  );
};

export default AccountLockedPage;
