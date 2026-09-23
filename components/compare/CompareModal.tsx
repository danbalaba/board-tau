"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { getDynamicIcon } from "@/lib/iconResolver";
import { getComparedListings } from "@/app/actions/compare";
import { useCompareStore } from "@/hooks/use-compare-store";
import { SharedAmenitiesModal } from "@/components/common/SharedAmenitiesModal";
import {
  getCachedPropertyTypes,
  getCachedAttributes,
  getCachedSubGroups,
  getSyncPropertyTypes,
  getSyncAttributes,
  getSyncSubGroups
} from "@/lib/landlordTaxonomyCache";

import { CompareHeader } from "./CompareHeader";
import { CompareTableView, exportCompareListingsToCsv } from "./CompareTableView";
import { CompareCardView } from "./CompareCardView";
import { CompareAiAdvisor } from "./CompareAiAdvisor";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingIds: string[];
}

export default function CompareModal({ isOpen, onClose, listingIds }: CompareModalProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { clearListings, getCachedListings, setCachedListings } = useCompareStore();

  const [viewMode, setViewMode] = useState<"CARDS" | "TABLE">("CARDS");
  const [activeTab, setActiveTab] = useState<"DATA" | "AI">("DATA");

  // Shared Amenities Breakdown Modal State
  const [amenitiesModalConfig, setAmenitiesModalConfig] = useState<{
    isOpen: boolean;
    initialCategory: 'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY';
    listing?: any;
  }>({
    isOpen: false,
    initialCategory: 'ALL'
  });

  // Taxonomy Cache State
  const [propertyTypes, setPropertyTypes] = useState<any[]>(() => getSyncPropertyTypes() || []);
  const [attributes, setAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);

  useEffect(() => {
    getCachedPropertyTypes().then(pts => { if (pts) setPropertyTypes(pts); });
    getCachedAttributes().then(attrs => { if (attrs) setAttributes(attrs); });
    getCachedSubGroups().then(sgs => { if (sgs) setDbSubGroups(sgs); });
  }, []);

  const resolveAmenityName = useCallback((attrId: string) => {
    if (!attrId) return '';
    const cleanId = attrId.includes('|') ? attrId.split('|')[0] : attrId;
    const matched = attributes.find(a => 
      a.id === cleanId || 
      a.value === cleanId || 
      a._id === cleanId || 
      a.code === cleanId || 
      cleanId.startsWith(a.id + '|')
    );
    if (matched) return matched.name || matched.label || matched.title;
    if (!/^[a-f0-9]{24}$/i.test(cleanId)) return cleanId.replace(/_/g, ' ').replace(/-/g, ' ');
    return cleanId;
  }, [attributes]);

  const getItemIcon = useCallback((name: string, attrId?: string, explicitIcon?: string) => {
    let resolvedIcon = explicitIcon;
    if (!resolvedIcon && attributes.length > 0) {
      const matched = attributes.find(a =>
        (attrId && a.id === attrId) ||
        (name && a.name?.toLowerCase() === name.toLowerCase())
      );
      if (matched?.icon) resolvedIcon = matched.icon;
    }
    const inputStr = (resolvedIcon && resolvedIcon !== 'Sparkles' && resolvedIcon !== 'Sparkle')
      ? `${name}|${resolvedIcon}`
      : name;

    return getDynamicIcon(inputStr, Sparkles);
  }, [attributes]);

  // Chat State
  const [messages, setMessages] = useState<{ role: "user" | "ai", content: string }[]>([
    { role: "ai", content: "Mabuhay! I'm **Kerby**, your BoardTAU AI Housing Advisor 🦬. I've analyzed these compared listings side-by-side. What would you like to know?" }
  ]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "Which property offers the best value for money?",
    "Compare the security and safety features.",
    "Which property has the strictest rules?"
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Copy & Text-to-Speech (Speaker) State
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // Auto-cancel speech on unmount/close & pre-warm voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopyMessage = (content: string, index: number) => {
    const plainText = content
      .replace(/\[BOOK:?\s*([^\]]+)\]\([^)]+\)/gi, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_#`~|]/g, '')
      .trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(plainText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleToggleSpeech = (content: string, index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Auto-scroll smooth to top of spoken message
    setTimeout(() => {
      const msgElement = document.getElementById(`ai-message-${index}`);
      if (msgElement) {
        msgElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    // Smart phonetic pre-processing for fluent Taglish / Philippine reading
    const textToRead = content
      .replace(/\[BOOK:?\s*([^\]]+)\]\([^)]+\)/gi, 'Proceed to reserve $1.')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/₱\s*(\d+(?:,\d+)*)/g, '$1 pesos')
      .replace(/\/mo\b/gi, ' per month')
      .replace(/\b24\/7\b/gi, 'twenty four seven')
      .replace(/\bTAU\b/g, 'T A U')
      .replace(/\bCCTV\b/g, 'C C T V')
      .replace(/\bWiFi\b/gi, 'why fy')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[*_#`~|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Auto-select best available voice (Tagalog/Philippine or High-Quality Natural voice)
    const voices = window.speechSynthesis.getVoices();
    const phVoice = voices.find(v => 
      v.lang.toLowerCase().includes("tl") || 
      v.lang.toLowerCase().includes("fil") || 
      v.lang.toLowerCase().includes("ph") ||
      v.name.toLowerCase().includes("philippines")
    );
    const naturalVoice = voices.find(v => 
      v.name.toLowerCase().includes("natural") || 
      v.name.toLowerCase().includes("online") || 
      v.name.toLowerCase().includes("google us english") ||
      v.name.toLowerCase().includes("samantha") ||
      v.name.toLowerCase().includes("zira")
    );

    if (phVoice) {
      utterance.voice = phVoice;
      utterance.lang = phVoice.lang;
    } else if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setSpeakingIndex(null);
    };
    utterance.onerror = (e) => {
      // Don't warn on expected user-initiated speech cancellation/interruption
      if (e.error !== "interrupted" && e.error !== "canceled") {
        console.warn("Speech synthesis error:", e);
      }
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isChatLoading]);

  const handleChatSubmit = async (e?: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault();
    const userMsg = directPrompt || chatInput.trim();
    if (!userMsg || isChatLoading) return;

    setChatInput("");
    setSuggestedPrompts([]);
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    const sortedIds = listingIds.sort().join("_");
    const cacheKey = `compare_ai_${sortedIds}_${userMsg.toLowerCase().trim()}`;
    
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.reply) {
            setMessages(prev => [...prev, { role: "ai", content: parsed.reply }]);
            if (parsed.suggestedPrompts && Array.isArray(parsed.suggestedPrompts)) {
              setSuggestedPrompts(parsed.suggestedPrompts);
              setShowPrompts(true);
            }
            return;
          }
        }
      } catch (err) {}
    }

    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings, userMessage: userMsg })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
        if (data.suggestedPrompts && Array.isArray(data.suggestedPrompts)) {
           setSuggestedPrompts(data.suggestedPrompts);
           setShowPrompts(true);
        }
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {}
        }
      } else {
        setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error while analyzing the listings." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, something went wrong on my end." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && listingIds.length > 0) {
      // 1. Check in-memory store cache first for 0ms instant display
      const cachedListings = getCachedListings(listingIds);
      if (cachedListings) {
        setListings(cachedListings);
        setIsLoading(false);
        return;
      }

      // 2. Fetch from Server Action on client cache miss
      setIsLoading(true);
      getComparedListings(listingIds).then((data) => {
        setListings(data);
        if (data && data.length > 0) {
          setCachedListings(data);
        }
        setIsLoading(false);
      });
    }
  }, [isOpen, listingIds, getCachedListings, setCachedListings]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleExportCsv = useCallback(() => {
    exportCompareListingsToCsv(listings, attributes, dbSubGroups);
  }, [listings, attributes, dbSubGroups]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="compare-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-white dark:bg-slate-900 w-full max-w-[1550px] 2xl:max-w-[1700px] h-full sm:h-[90vh] lg:h-[92vh] rounded-none sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col border-0 sm:border border-slate-200/80 dark:border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <CompareHeader
            viewMode={viewMode}
            setViewMode={setViewMode}
            onClose={onClose}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onExportCsv={handleExportCsv}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Mobile Animated View (One tab visible at a time with smooth slide/fade) */}
            <div className="md:hidden flex-1 overflow-hidden relative w-full h-full">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === "DATA" ? (
                  <motion.div
                    key="tab-specs"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="w-full h-full p-2.5 sm:p-4 bg-[#F8FAF9] dark:bg-[#0f1419] overflow-x-auto overflow-y-hidden"
                  >
                    {isLoading ? (
                      <div className="h-full flex flex-col items-center justify-center text-primary">
                        <Loader2 className="animate-spin w-10 h-10 mb-4" />
                        <span className="font-bold">Fetching listing data...</span>
                      </div>
                    ) : viewMode === "TABLE" ? (
                      <CompareTableView
                        listings={listings}
                        attributes={attributes}
                        dbSubGroups={dbSubGroups}
                        resolveAmenityName={resolveAmenityName}
                        getItemIcon={getItemIcon}
                        onClose={onClose}
                        clearListings={clearListings}
                        onExportCsv={handleExportCsv}
                      />
                    ) : (
                      <CompareCardView
                        listings={listings}
                        attributes={attributes}
                        resolveAmenityName={resolveAmenityName}
                        getItemIcon={getItemIcon}
                        setAmenitiesModalConfig={setAmenitiesModalConfig}
                        onClose={onClose}
                        clearListings={clearListings}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="tab-advisor"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="w-full h-full bg-white dark:bg-slate-900 flex flex-col"
                  >
                    <CompareAiAdvisor
                      messages={messages}
                      chatInput={chatInput}
                      setChatInput={setChatInput}
                      isChatLoading={isChatLoading}
                      suggestedPrompts={suggestedPrompts}
                      showPrompts={showPrompts}
                      setShowPrompts={setShowPrompts}
                      handleChatSubmit={handleChatSubmit}
                      handleCopyMessage={handleCopyMessage}
                      handleToggleSpeech={handleToggleSpeech}
                      copiedIndex={copiedIndex}
                      speakingIndex={speakingIndex}
                      chatScrollRef={chatScrollRef}
                      onClose={onClose}
                      clearListings={clearListings}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Dual-Pane Layout (Always visible side-by-side on md+ screens) */}
            <div className="hidden md:flex flex-1 overflow-hidden w-full h-full">
              {/* Left Side: Data View (Cards or Table) */}
              <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-4 md:p-6 bg-[#F8FAF9] dark:bg-[#0f1419]">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-primary">
                    <Loader2 className="animate-spin w-10 h-10 mb-4" />
                    <span className="font-bold">Fetching listing data...</span>
                  </div>
                ) : viewMode === "TABLE" ? (
                  <CompareTableView
                    listings={listings}
                    attributes={attributes}
                    dbSubGroups={dbSubGroups}
                    resolveAmenityName={resolveAmenityName}
                    getItemIcon={getItemIcon}
                    onClose={onClose}
                    clearListings={clearListings}
                    onExportCsv={handleExportCsv}
                  />
                ) : (
                  <CompareCardView
                    listings={listings}
                    attributes={attributes}
                    resolveAmenityName={resolveAmenityName}
                    getItemIcon={getItemIcon}
                    setAmenitiesModalConfig={setAmenitiesModalConfig}
                    onClose={onClose}
                    clearListings={clearListings}
                  />
                )}
              </div>

              {/* Right Side: AI Chat */}
              <div className="w-[420px] lg:w-[480px] xl:w-[520px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                <CompareAiAdvisor
                  messages={messages}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  isChatLoading={isChatLoading}
                  suggestedPrompts={suggestedPrompts}
                  showPrompts={showPrompts}
                  setShowPrompts={setShowPrompts}
                  handleChatSubmit={handleChatSubmit}
                  handleCopyMessage={handleCopyMessage}
                  handleToggleSpeech={handleToggleSpeech}
                  copiedIndex={copiedIndex}
                  speakingIndex={speakingIndex}
                  chatScrollRef={chatScrollRef}
                  onClose={onClose}
                  clearListings={clearListings}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Full-Screen Shared Amenities Breakdown Modal */}
      {amenitiesModalConfig.listing && (
        <SharedAmenitiesModal
          key="compare-shared-amenities-modal"
          isOpen={amenitiesModalConfig.isOpen}
          onClose={() => setAmenitiesModalConfig(prev => ({ ...prev, isOpen: false }))}
          propertyTitle={amenitiesModalConfig.listing.title}
          initialCategory={amenitiesModalConfig.initialCategory}
          amenities={amenitiesModalConfig.listing.amenities_list || amenitiesModalConfig.listing.amenities}
          customRules={amenitiesModalConfig.listing.rules?.customRules || amenitiesModalConfig.listing.customRules}
          customFeatures={amenitiesModalConfig.listing.features?.customFeatures || amenitiesModalConfig.listing.customFeatures}
          rulesObj={amenitiesModalConfig.listing.rules}
          featuresObj={amenitiesModalConfig.listing.features}
          rooms={amenitiesModalConfig.listing.rooms}
        />
      )}
    </AnimatePresence>
  );
}
