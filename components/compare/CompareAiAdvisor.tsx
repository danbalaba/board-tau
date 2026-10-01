"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User as UserIcon,
  Send,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Download
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Image from "next/image";

export const TypingIndicator = () => (
  <div className="flex gap-1.5 items-center px-1">
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
  </div>
);

interface CompareAiAdvisorProps {
  messages: { role: "user" | "ai"; content: string }[];
  chatInput: string;
  setChatInput: (val: string) => void;
  isChatLoading: boolean;
  suggestedPrompts: string[];
  showPrompts: boolean;
  setShowPrompts: (show: boolean) => void;
  handleChatSubmit: (e?: React.FormEvent, directPrompt?: string) => void;
  handleCopyMessage: (content: string, index: number) => void;
  handleToggleSpeech: (content: string, index: number) => void;
  copiedIndex: number | null;
  speakingIndex: number | null;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  clearListings: () => void;
}

export const CompareAiAdvisor: React.FC<CompareAiAdvisorProps> = ({
  messages,
  chatInput,
  setChatInput,
  isChatLoading,
  suggestedPrompts,
  showPrompts,
  setShowPrompts,
  handleChatSubmit,
  handleCopyMessage,
  handleToggleSpeech,
  copiedIndex,
  speakingIndex,
  chatScrollRef,
  onClose,
  clearListings
}) => {
  const [isExported, setIsExported] = useState(false);

  const handleExportChat = () => {
    if (!messages || messages.length === 0) return;

    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    let fileContent = `==================================================\n`;
    fileContent += ` BOARDTAU - KERBY AI HOUSING ADVISOR CHAT TRANSCRIPT\n`;
    fileContent += ` Date: ${timestamp}\n`;
    fileContent += `==================================================\n\n`;

    messages.forEach((msg) => {
      const speaker = msg.role === "user" ? "YOU (Student)" : "KERBY AI ADVISOR";
      const cleanContent = msg.content
        .replace(/\[BOOK:?\s*([^\]]+)\]\([^)]+\)/gi, 'Proceed to reserve $1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      fileContent += `[${speaker}]\n${cleanContent}\n\n--------------------------------------------------\n\n`;
    });

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BoardTAU_Kerby_AI_Chat_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  const markdownComponents = {
    table: ({ node, ...props }: any) => (
      <div className="my-3 w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed text-[11px] sm:text-xs" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-[#2f7d6d] dark:bg-emerald-800 text-white font-bold uppercase tracking-wider text-[10px]" {...props} />
    ),
    tbody: ({ node, ...props }: any) => (
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900" {...props} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="px-2 py-1.5 font-black border-r border-[#2f7d6d]/40 dark:border-emerald-700/40 last:border-0 whitespace-normal break-words align-top text-[10px] text-white" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="px-2 py-1.5 font-medium text-slate-700 dark:text-slate-200 border-r border-b border-slate-100 dark:border-slate-800 last:border-r-0 whitespace-normal break-words align-top leading-relaxed text-[11px]" {...props} />
    ),
    a: ({ node, ...props }: any) => {
      const isBooking = props.children?.toString().includes("BOOK:");
      const btnText = isBooking ? props.children?.toString().replace("BOOK:", "Proceed to ") : props.children;
      
      return (
        <Link 
          href={props.href || "#"} 
          onClick={() => {
            onClose();
            clearListings();
          }}
          className="block mt-2 w-full text-center bg-primary text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:scale-[1.02] transition shadow-md no-underline cursor-pointer"
        >
          {btnText}
        </Link>
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2f7d6d]/20 dark:bg-emerald-500/20 border border-[#2f7d6d]/40 dark:border-emerald-500/40 flex items-center justify-center shrink-0 overflow-hidden p-0.5 shadow-sm backdrop-blur-md">
            <Image src="/assets/mascot/kerby-ai-face.png" alt="Kerby" width={30} height={30} className="object-contain scale-110" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
              Kerby AI Advisor <Sparkles size={15} className="text-primary" />
            </h3>
            <p className="text-[10px] text-slate-500">Official TAU Housing AI • Online</p>
          </div>
        </div>

        {/* Export Chat History Button */}
        <button
          type="button"
          onClick={handleExportChat}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-emerald-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/40 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          title="Export Chat History as Text File"
        >
          {isExported ? (
            <>
              <Check size={14} className="text-emerald-500 shrink-0" />
              <span className="text-emerald-500 font-extrabold text-[11px]">Exported!</span>
            </>
          ) : (
            <>
              <Download size={14} className="shrink-0" />
              <span className="text-[11px]">Export Chat</span>
            </>
          )}
        </button>
      </div>
      
      {/* Messages */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50"
      >
        {messages.map((msg, idx) => {
          return (
            <motion.div 
              id={`ai-message-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex items-start gap-3 w-full scroll-mt-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm mt-1 ${msg.role === "user" ? "bg-primary text-white" : "bg-[#2f7d6d]/20 dark:bg-emerald-500/20 border border-[#2f7d6d]/40 dark:border-emerald-500/40 p-0.5 backdrop-blur-md"}`}>
                {msg.role === "user" ? <UserIcon size={14} /> : <Image src="/assets/mascot/kerby-ai-face.png" alt="Kerby" width={28} height={28} className="object-contain scale-110" />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${
                msg.role === "user" 
                  ? "bg-primary text-white rounded-tr-sm shadow-md" 
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm leading-relaxed"
              }`}>
                {msg.role === "user" ? (
                   msg.content
                ) : (
                  <>
                     <ReactMarkdown 
                       key={idx}
                       remarkPlugins={[remarkGfm]}
                       className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 max-w-none"
                       components={markdownComponents}
                     >
                        {msg.content}
                     </ReactMarkdown>

                     {/* Message Action Toolbar (Copy & Text-To-Speech) */}
                     <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 select-none">
                       <button
                         type="button"
                         onClick={() => handleCopyMessage(msg.content, idx)}
                         className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer"
                         title="Copy message to clipboard"
                       >
                         {copiedIndex === idx ? (
                           <>
                             <Check size={13} className="text-emerald-500 shrink-0" />
                             <span className="text-emerald-500 font-extrabold">Copied!</span>
                           </>
                         ) : (
                           <>
                             <Copy size={13} className="shrink-0" />
                             <span>Copy</span>
                           </>
                         )}
                       </button>

                       {typeof window !== "undefined" && "speechSynthesis" in window && (
                         <button
                           type="button"
                           onClick={() => handleToggleSpeech(msg.content, idx)}
                           className={`flex items-center gap-1 text-[11px] font-bold transition-colors px-2 py-1 rounded-md cursor-pointer ${
                             speakingIndex === idx
                               ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
                               : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                           }`}
                           title={speakingIndex === idx ? "Stop Listening" : "Listen to Kerby"}
                         >
                           {speakingIndex === idx ? (
                             <>
                               <VolumeX size={13} className="animate-pulse shrink-0" />
                               <span className="font-extrabold">Stop</span>
                             </>
                           ) : (
                             <>
                               <Volume2 size={13} className="shrink-0" />
                               <span>Listen</span>
                             </>
                           )}
                         </button>
                       )}
                     </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}

        {isChatLoading && (
          <div className="flex items-start gap-3 w-full">
            <div className="w-8 h-8 rounded-full bg-[#2f7d6d]/20 dark:bg-emerald-500/20 border border-[#2f7d6d]/40 dark:border-emerald-500/40 p-0.5 flex items-center justify-center shrink-0 shadow-sm mt-1">
              <Image src="/assets/mascot/kerby-ai-face.png" alt="Kerby" width={28} height={28} className="object-contain scale-110" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts (Collapsible Stack) */}
      <AnimatePresence>
        {suggestedPrompts.length > 0 && !isChatLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-3 flex flex-col gap-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 w-full pt-2 shrink-0"
          >
            <div className="flex justify-start w-full">
              <button 
                type="button"
                onClick={() => setShowPrompts(!showPrompts)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2f7d6d] dark:hover:text-emerald-400 transition-colors px-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {showPrompts ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                {showPrompts ? "Hide Suggestions" : "Show Suggestions"}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showPrompts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2 items-end w-full overflow-hidden"
                >
                  {suggestedPrompts.map((prompt, i) => (
                    <motion.button 
                      key={prompt}
                      type="button"
                      initial={{ opacity: 0, scale: 0.95, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0, transition: { delay: i * 0.05 } }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      onClick={() => handleChatSubmit(undefined, prompt)}
                      className="text-xs sm:text-sm font-normal bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-full rounded-tr-xs border border-[#2f7d6d]/25 dark:border-emerald-500/30 hover:bg-[#2f7d6d] hover:text-white dark:hover:bg-[#2f7d6d] transition-all text-right max-w-[92%] whitespace-normal shadow-sm backdrop-blur-md cursor-pointer"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <form onSubmit={handleChatSubmit} className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Ask about these properties..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatLoading}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isChatLoading || !chatInput.trim()}
            className="absolute right-1.5 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={16} className="ml-px" />
          </button>
        </form>
      </div>
    </div>
  );
};
