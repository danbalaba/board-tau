"use client"

import React from "react"
import { motion } from "framer-motion"

interface ModernLoaderProps {
  text?: string
  fullPage?: boolean
}

const ModernLoader: React.FC<ModernLoaderProps> = ({ 
  text = "Loading contents...", 
  fullPage = false 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-20 h-20">
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Middle rotating dashed ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-dashed border-primary/40"
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner spinning loader */}
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-primary shadow-[0_0_15px_rgba(47,125,109,0.3)]"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(47,125,109,0.5)]" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <motion.p
          className="text-sm font-bold tracking-widest uppercase text-primary/80"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
        <div className="w-24 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-20 px-4">
      {content}
    </div>
  )
}

export default ModernLoader
