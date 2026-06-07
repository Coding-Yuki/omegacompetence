"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export function GenerativeAvatar({ name }: { name: string }) {
  const initials = useMemo(() => {
    if (!name.trim()) return "?";
    return name.trim().split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }, [name]);

  const hasName = name.trim().length > 0;

  return (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
      {/* Dynamic Glow */}
      <motion.div 
        animate={{
          scale: hasName ? [1, 1.2, 1] : 1,
          opacity: hasName ? 0.6 : 0.2,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-blue-600 blur-xl"
      />
      
      {/* Glass Orb */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex items-center justify-center w-full h-full rounded-full border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.span 
            key={initials}
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50"
          >
            {initials}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
