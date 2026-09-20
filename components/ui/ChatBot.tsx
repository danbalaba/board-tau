'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronDown, ChevronUp, Sparkles, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Modal from '@/components/modals/Modal';
import AuthModal from '@/components/modals/AuthModal';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

const TypingIndicator = () => (
  <div className="flex gap-1.5 items-center px-1">
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }} className="w-1.5 h-1.5 bg-[#2f7d6d] dark:bg-emerald-400 rounded-full" />
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }} className="w-1.5 h-1.5 bg-[#2f7d6d] dark:bg-emerald-400 rounded-full" />
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }} className="w-1.5 h-1.5 bg-[#2f7d6d] dark:bg-emerald-400 rounded-full" />
  </div>
);

// Typewriter component for initial assistant greeting with deterministic slicing
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 25 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsFinished(false);

    const timer = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
      } else {
        setIsFinished(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="markdown-content space-y-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:m-0 [&_strong]:font-bold [&_strong]:text-[#2f7d6d] dark:[&_strong]:text-emerald-400">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      {!isFinished && (
        <span className="inline-block w-1.5 h-4 bg-[#2f7d6d] dark:bg-emerald-400 ml-1 animate-pulse rounded-full align-middle" />
      )}
    </div>
  );
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  isInitial?: boolean;
};

const STORAGE_KEY = 'boardtau_kerby_chat_history';

const DEFAULT_GREETING: Message = {
  role: 'assistant',
  content: "Mabuhay! I'm **Kerby**, your BoardTAU AI Assistant 🦬. How can I help you find student housing or navigate campus today?",
  isInitial: true
};

const DEFAULT_PROMPTS = [
  "How do I book a room?",
  "What is required for KYC?",
  "Where is BoardTAU located?",
  "What does this page do?"
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const isLoadedRef = useRef(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            return parsed.messages;
          }
        }
      } catch (err) {}
    }
    return [DEFAULT_GREETING];
  });

  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.suggestedPrompts) && parsed.suggestedPrompts.length > 0) {
            return parsed.suggestedPrompts;
          }
        }
      } catch (err) {}
    }
    return DEFAULT_PROMPTS;
  });

  const [showPrompts, setShowPrompts] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const pathname = (typeof usePathname === 'function' ? usePathname() : "") || "";
  const router = useRouter();
  const isListingDetail = pathname.startsWith('/listings/') && pathname.split('/').length > 2;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useScrollDirection();
  const isHiddenOnMobile = scrollDirection === "up" || scrollDirection === "";

  // Mark component as mounted/loaded
  useEffect(() => {
    isLoadedRef.current = true;
  }, []);

  // Save chat history to localStorage whenever messages or suggestedPrompts change
  useEffect(() => {
    if (isLoadedRef.current && typeof window !== "undefined" && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, suggestedPrompts }));
      } catch (err) {}
    }
  }, [messages, suggestedPrompts]);

  const handleClearChat = () => {
    if (isResetting) return;
    setIsResetting(true);
    setMessages([]); // Immediately clear old messages so typing indicator is front and center
    setSuggestedPrompts([]); // Temporarily hide chips during loader

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {}
    }

    setTimeout(() => {
      setMessages([
        {
          role: 'assistant',
          content: "Conversation reset successfully! Mabuhay, I'm **Kerby**, your BoardTAU AI Assistant 🦬. How can I help you find student housing or navigate campus today?",
          isInitial: true
        }
      ]);
      setSuggestedPrompts(DEFAULT_PROMPTS);
      setShowPrompts(true);
      setIsResetting(false);
    }, 550);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  // Prevent background scrolling when interacting with the chatbot
  useEffect(() => {
    if (!isOpen) return;

    const container = document.getElementById('chatbot-wrapper');
    if (!container) return;

    const preventScroll = (e: Event) => {
      const scrollableArea = document.getElementById('chatbot-scrollable');
      // If the event target is inside the scrollable area, let overscroll-contain handle it
      if (scrollableArea && scrollableArea.contains(e.target as Node)) {
        return;
      }
      // Otherwise, prevent scrolling the background
      e.preventDefault();
    };

    container.addEventListener('wheel', preventScroll, { passive: false });
    container.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      container.removeEventListener('wheel', preventScroll);
      container.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setInput('');

    // Client-side SessionStorage caching key
    const cacheKey = `chatbot_cache_${pathname}_${text.trim().toLowerCase()}`;
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.reply) {
            setMessages([...newMessages, { role: 'assistant', content: parsed.reply }]);
            setSuggestedPrompts(parsed.suggestedPrompts?.length > 0 ? parsed.suggestedPrompts : DEFAULT_PROMPTS);
            setShowPrompts(true);
            return;
          }
        }
      } catch (err) {
        // Ignore storage access errors
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          currentPath: pathname
        })
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        const promptsToSet = (data.suggestedPrompts && Array.isArray(data.suggestedPrompts) && data.suggestedPrompts.length > 0)
          ? data.suggestedPrompts
          : DEFAULT_PROMPTS;
        setSuggestedPrompts(promptsToSet);
        setShowPrompts(true);

        // Cache response in sessionStorage
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {}
        }
      } else {
        throw new Error('No response');
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal>
      <Modal.Trigger name="Login">
        <button id="chatbot-login-btn" className="hidden" />
      </Modal.Trigger>
      <Modal.Trigger name="Sign up">
        <button id="chatbot-signup-btn" className="hidden" />
      </Modal.Trigger>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-wrapper"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-[100] flex flex-col bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl font-sans overflow-hidden border-l border-slate-200/80 dark:border-white/10 shadow-[-15px_0_50px_rgba(0,0,0,0.35)]",
              "w-full md:w-[440px] h-[100dvh] rounded-none"
            )}
          >
            {/* Header - Dynamic iOS Liquid Glass style with larger avatar */}
            <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl text-slate-900 dark:text-white shadow-sm z-10 relative overflow-hidden border-b border-white/50 dark:border-white/10 ring-1 ring-white/30 dark:ring-white/10">
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-1 bg-[#2f7d6d]/15 dark:bg-white/10 rounded-full backdrop-blur-md flex items-center justify-center w-14 h-14 border border-[#2f7d6d]/30 dark:border-white/20 shadow-inner overflow-hidden shrink-0">
                  <Image src="/assets/mascot/kerby-ai-face.png" alt="Kerby AI Face" width={48} height={48} className="object-contain drop-shadow-md scale-110" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg leading-tight text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                    Kerby AI <Sparkles className="w-4 h-4 text-[#2f7d6d] dark:text-emerald-300 fill-[#2f7d6d] dark:fill-emerald-300" />
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <p className="text-xs text-slate-600 dark:text-emerald-200/90 font-medium tracking-wide">Official TAU Assistant • Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
                {(messages.length > 1 || isResetting) && (
                  <button
                    onClick={handleClearChat}
                    disabled={isResetting}
                    className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-white/20 backdrop-blur-md transition-colors relative z-10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer disabled:opacity-50"
                    title="Reset Conversation"
                    aria-label="Reset Conversation"
                  >
                    <RotateCcw size={18} className={cn(isResetting && "animate-spin text-[#2f7d6d] dark:text-emerald-400")} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-white/20 backdrop-blur-md transition-colors relative z-10 text-slate-700 dark:text-white cursor-pointer"
                  aria-label="Close Assistant"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div id="chatbot-scrollable" className="flex-1 overflow-y-auto overscroll-none p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/40 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={cn("flex w-full gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-full bg-[#2f7d6d]/20 dark:bg-emerald-500/20 border border-[#2f7d6d]/40 dark:border-emerald-500/40 flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden p-0.5 backdrop-blur-md">
                      <Image src="/assets/mascot/kerby-ai-face.png" alt="Kerby" width={34} height={34} className="object-contain scale-110" />
                    </div>
                  )}
                  <div className={cn(
                    "px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm",
                    msg.role === 'user'
                      ? "bg-gradient-to-r from-[#2f7d6d] to-emerald-700 text-white rounded-tr-xs shadow-md border border-emerald-400/20 font-medium"
                      : "bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-tl-xs text-slate-900 dark:text-slate-100"
                  )}>
                    {msg.role === 'assistant' ? (
                      msg.isInitial ? (
                        <TypewriterText text={msg.content} />
                      ) : (
                        <div className="markdown-content space-y-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:m-0 [&_strong]:font-bold [&_strong]:text-[#2f7d6d] dark:[&_strong]:text-emerald-400">
                          <ReactMarkdown
                            components={{
                              a: ({ node, ...props }) => {
                                const isNav = props.children?.toString().includes("NAV:");
                                const btnText = isNav ? props.children?.toString().replace("NAV:", "").trim() : props.children;
                                let href = props.href || "#";

                                // Fallback mapping for common about/learn more buttons if AI generates dead # link
                                if (href === '#' || !href) {
                                  const labelLower = String(btnText).toLowerCase();
                                  if (labelLower.includes("about") || labelLower.includes("founder")) href = "/about";
                                  else if (labelLower.includes("how") || labelLower.includes("work")) href = "/about/boardtau";
                                  else if (labelLower.includes("contact") || labelLower.includes("support")) href = "/support/contact";
                                  else if (labelLower.includes("faq")) href = "/faqs";
                                  else if (labelLower.includes("browse") || labelLower.includes("listing")) href = "/";
                                }

                                const handleNavigation = (e: React.MouseEvent) => {
                                  e.preventDefault();
                                  if (!href || href === '#') return;
                                  setIsOpen(false);
                                  
                                  if (href === '/login') {
                                    document.getElementById('chatbot-login-btn')?.click();
                                  } else if (href === '/register' || href === '/signup') {
                                    document.getElementById('chatbot-signup-btn')?.click();
                                  } else {
                                    router.push(href);
                                  }
                                };

                                if (isNav) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={handleNavigation}
                                      className="block mt-3 w-full text-center bg-[#2f7d6d] hover:bg-[#256659] text-white py-2.5 px-4 rounded-full font-extrabold text-sm hover:scale-[1.02] transition shadow-md shadow-[#2f7d6d]/30 no-underline cursor-pointer"
                                    >
                                      {btnText}
                                    </button>
                                  );
                                }
                                return (
                                  <a
                                    {...props}
                                    onClick={handleNavigation}
                                    className="text-[#2f7d6d] dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                                  >
                                    {props.children}
                                  </a>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {(isLoading || isResetting) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full gap-3 justify-start">
                  <div className="w-10 h-10 rounded-full bg-[#2f7d6d]/20 dark:bg-emerald-500/20 border border-[#2f7d6d]/40 dark:border-emerald-500/40 flex items-center justify-center shrink-0 mt-1 overflow-hidden p-0.5 shadow-sm backdrop-blur-md">
                    <Image src="/assets/mascot/kerby-ai-face.png" alt="Kerby" width={34} height={34} className="object-contain scale-110" />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-tl-xs flex items-center gap-2 shadow-sm">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <AnimatePresence>
              {suggestedPrompts.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 pb-3 pt-2 flex flex-col gap-2 bg-slate-100/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 w-full"
                >
                  <div className="flex justify-start w-full">
                    <button
                      onClick={() => setShowPrompts(!showPrompts)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2f7d6d] dark:hover:text-emerald-400 transition-colors px-2.5 py-1 rounded-full hover:bg-white/40 dark:hover:bg-white/10"
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
                            initial={{ opacity: 0, scale: 0.95, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0, transition: { delay: i * 0.05 } }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                            onClick={() => handleSend(prompt)}
                            className="text-xs sm:text-sm font-normal bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-full rounded-tr-xs border border-[#2f7d6d]/25 dark:border-emerald-500/30 hover:bg-[#2f7d6d] hover:text-white dark:hover:bg-[#2f7d6d] transition-all text-right max-w-[90%] whitespace-normal shadow-sm backdrop-blur-md"
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

            {/* Floating Input Area */}
            <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/15 focus-within:border-[#2f7d6d] focus-within:ring-2 focus-within:ring-[#2f7d6d]/30 transition-all shadow-inner backdrop-blur-xl"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Kerby AI anything..."
                  className="flex-1 bg-transparent px-3 py-1.5 text-[15px] outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-full bg-[#2f7d6d] hover:bg-[#256659] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white transition-all shrink-0 shadow-md shadow-[#2f7d6d]/30"
                >
                  <Send size={16} className={input.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <div className={cn(
        `fixed ${isListingDetail ? 'bottom-32' : 'bottom-20'} right-4 md:bottom-8 md:right-8 z-[50] transition-transform duration-300 ease-in-out`,
        isHiddenOnMobile && !isOpen ? "translate-y-48 md:translate-y-0" : "translate-y-0",
        pathname.startsWith('/become-a-host') && "hidden md:block"
      )}>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "relative flex items-center justify-center shadow-[0_12px_35px_rgba(0,0,0,0.3)]",
            "w-14 h-14 rounded-full text-white backdrop-blur-2xl",
            isOpen ? "bg-rose-500 hover:bg-rose-600 border border-white/30" : "bg-white/90 dark:bg-slate-900/90 border-2 border-[#2f7d6d] hover:bg-slate-50 dark:hover:bg-slate-800",
            "transition-all duration-300"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={26} strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center justify-center w-full h-full p-1 overflow-hidden">
                <Image src="/assets/mascot/kerby-ai-face.png" alt="Kerby AI Face" width={44} height={44} className="object-contain drop-shadow-md scale-110" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <Modal.Window name="Login" size="sm" closeOnOutsideClick={false}>
        <AuthModal name="Login" />
      </Modal.Window>
      <Modal.Window name="Sign up" size="sm" closeOnOutsideClick={false}>
        <AuthModal name="Sign up" />
      </Modal.Window>
    </Modal>
  );
}
