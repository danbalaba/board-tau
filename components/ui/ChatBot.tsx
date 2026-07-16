'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Modal from '@/components/modals/Modal';
import AuthModal from '@/components/modals/AuthModal';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

const TypingIndicator = () => (
  <div className="flex gap-1.5 items-center px-1">
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
  </div>
);

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your BoardTAU AI Assistant. How can I help you today?" }
  ]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "How do I book a room?",
    "What is required for KYC?",
    "Where is BoardTAU located?",
    "What does this page do?"
  ]);
  const [showPrompts, setShowPrompts] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useScrollDirection();
  const isHiddenOnMobile = scrollDirection === "up" || scrollDirection === "";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setInput('');
    setSuggestedPrompts([]); // Clear chips while loading
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
        if (data.suggestedPrompts && Array.isArray(data.suggestedPrompts)) {
           setSuggestedPrompts(data.suggestedPrompts);
           setShowPrompts(true); // Auto-expand when new prompts arrive
        } else {
           setSuggestedPrompts([]);
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
            initial={{ opacity: 0, y: 50, scale: 0.9, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, originX: 1, originY: 1 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="fixed bottom-24 right-4 md:bottom-[115px] md:right-10 z-[70] w-[calc(100vw-32px)] md:w-[400px] h-[550px] max-h-[80vh] flex flex-col bg-card rounded-3xl shadow-xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary via-primary to-emerald-800 text-primary-foreground shadow-md z-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-1 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center w-10 h-10 border border-white/30 shadow-inner">
                  <Image src="/logo.png" alt="BoardTAU" width={24} height={24} className="object-contain drop-shadow-md" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight text-white flex items-center gap-1.5">
                    BoardTAU AI
                  </h3>
                  <p className="text-xs text-white/80 font-medium tracking-wide">Online | Ready to assist</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors relative z-10 text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-background/50">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={cn("flex w-full gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden">
                      <Image src="/logo.png" alt="AI" width={20} height={20} className="object-contain" />
                    </div>
                  )}
                  <div className={cn(
                    "px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-gradient-to-br from-primary to-emerald-700 text-white rounded-tr-sm" 
                      : "bg-card border border-border rounded-tl-sm text-foreground"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-content space-y-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:m-0 [&_strong]:font-semibold [&_strong]:text-primary">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => {
                              const isNav = props.children?.toString().includes("NAV:");
                              const btnText = isNav ? props.children?.toString().replace("NAV:", "").trim() : props.children;
                              const href = props.href || "#";
                              
                              if (isNav) {
                                return (
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setIsOpen(false);
                                      if (href === '/login') {
                                        document.getElementById('chatbot-login-btn')?.click();
                                      } else if (href === '/register' || href === '/signup') {
                                        document.getElementById('chatbot-signup-btn')?.click();
                                      } else {
                                        router.push(href);
                                      }
                                    }}
                                    className="block mt-3 w-full text-center bg-primary text-primary-foreground py-2.5 px-4 rounded-xl font-bold text-sm hover:scale-[1.02] transition shadow-md no-underline"
                                  >
                                    {btnText}
                                  </button>
                                );
                              }
                              return <a {...props} className="text-primary hover:underline font-semibold" />;
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden shadow-sm">
                    <Image src="/logo.png" alt="AI" width={20} height={20} className="object-contain" />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl bg-card border border-border rounded-tl-sm flex items-center gap-2 shadow-sm">
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
                  className="px-4 pb-4 pt-2 flex flex-col gap-2 bg-background/50 border-t border-border w-full"
                >
                  <div className="flex justify-start w-full">
                    <button 
                      onClick={() => setShowPrompts(!showPrompts)}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
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
                            className="text-sm font-medium bg-slate-50 dark:bg-slate-800 text-primary dark:text-primary/90 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-primary/20 hover:bg-primary/10 transition text-right max-w-[90%] whitespace-normal shadow-sm"
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

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-card">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 bg-background p-1.5 rounded-full border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent px-4 py-2 text-[15px] outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-full bg-primary hover:bg-primary/90 dark:bg-primary/20 dark:hover:bg-primary/30 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white dark:text-primary transition-all shrink-0 shadow-sm"
                >
                  <Send size={18} className={input.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <div className={cn(
        "fixed bottom-6 right-4 md:right-8 z-[50] transition-transform duration-300 ease-in-out",
        isHiddenOnMobile && !isOpen ? "translate-y-48 md:translate-y-0" : "translate-y-0"
      )}>
        
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative flex items-center justify-center shadow-2xl",
            "w-14 h-14 rounded-full text-white",
            isOpen ? "bg-rose-500 hover:bg-rose-600 border border-white/20" : "bg-white dark:bg-slate-800 border-2 border-primary hover:bg-slate-50 dark:hover:bg-slate-700",
            "transition-all duration-300"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={26} strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center justify-center w-full h-full p-2.5">
                <Image src="/logo.png" alt="Chat" width={32} height={32} className="object-contain drop-shadow-sm" />
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
