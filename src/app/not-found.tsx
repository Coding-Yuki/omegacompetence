"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Ghost, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="aurora-orb-red absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 blur-[150px] scale-150" />
      
      <motion.div 
        className="relative z-10 text-center px-4 flex flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Image src="/omega-logo.png" alt="OMEGA COMPETENCE" width={180} height={55} className="mb-10 drop-shadow-sm opacity-30 grayscale" />
        
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="relative">
          <div className="absolute inset-0 bg-foreground/5 blur-2xl rounded-full" />
          <Ghost className="h-28 w-28 text-foreground/10 mb-6 relative z-10" strokeWidth={1} />
        </motion.div>

        <h1 className="text-6xl font-black tracking-tighter mb-4 text-gradient">404</h1>
        <h2 className="text-xl font-semibold mb-3 text-foreground/70 tracking-tight">Secteur Inconnu</h2>
        <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-sm leading-relaxed">
          Le document ou le secteur que vous recherchez n'existe plus dans la base de données d'OMEGA.
        </p>

        <Button 
          size="lg" 
          onClick={() => router.push("/")} 
          className="rounded-xl bg-background border border-border text-foreground hover:bg-muted shadow-lg dark:shadow-2xl transition-all duration-300 backdrop-blur-xl group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 text-muted-foreground group-hover:-translate-x-1 transition-transform" /> 
          Retourner au portail
        </Button>
      </motion.div>
    </div>
  );
}
