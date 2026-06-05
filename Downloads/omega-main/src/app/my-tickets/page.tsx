"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getTickets } from "@/app/actions";
import { CommandMenu } from "@/components/command-menu";
import { motion, AnimatePresence } from "framer-motion";
import { SmartTicketForm } from "@/components/SmartTicketForm";
import { AuroraBackground } from "@/components/AuroraBackground";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CheckCircle2, Zap, Clock, ShieldCheck } from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const springCard = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function EmployeeDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const loadTickets = useCallback(async () => {
    if (user?.email) {
      setFetching(true);
      const res = await getTickets(user.email);
      if (res.success) setTickets(res.tickets);
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/");
      else loadTickets();
    }
  }, [user, loading, router, loadTickets]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!mainRef.current) return;
    const cards = mainRef.current.querySelectorAll('.bento-card') as NodeListOf<HTMLElement>;
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);
    });
  }, []);

  const handleSuccess = () => {
    setDialogOpen(false);
    loadTickets();
  };

  if (!mounted || loading || !user) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden text-foreground selection:bg-blue-500/30">
      <div className="mesh-bg">
        <div className="mesh-bg-gradient opacity-60 dark:opacity-100" />
        <div className="bg-grid-modern opacity-40 dark:opacity-60" />
      </div>
      <Navbar />

      <main 
        ref={mainRef}
        onMouseMove={handleMouseMove}
        className="flex-1 container mx-auto px-4 md:px-8 py-10 max-w-5xl relative z-10"
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          <motion.div variants={springCard} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Zap className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300">Espace Opérationnel</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 text-foreground">Centre de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Support</span></h1>
              <p className="text-muted-foreground text-sm">Signalez une anomalie via notre IA prédictive.</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger className="group neo-button inline-flex items-center justify-center rounded-2xl bg-primary hover:opacity-90 text-primary-foreground shadow-md transition-all h-12 px-6 font-bold border-none cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                  Initialiser Requête
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] bg-popover/90 backdrop-blur-3xl border-border text-popover-foreground shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                  
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                      <ShieldCheck className="h-8 w-8 text-blue-500" /> Anomalie
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                      Le Neural Core analysera votre diagnostic en temps réel.
                    </DialogDescription>
                  </DialogHeader>

                  <SmartTicketForm userEmail={user.email as string} onSuccess={handleSuccess} />
                  
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {fetching ? (
            <div className="grid gap-5">
              {[1, 2, 3].map(i => <div key={i} className="h-28 w-full rounded-[2rem] bg-muted/50 animate-pulse border border-border/50" />)}
            </div>
          ) : tickets.length === 0 ? (
            <motion.div variants={springCard} className="mt-20 flex flex-col items-center text-center">
              <motion.div 
                animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-10"
              >
                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full scale-150" />
                <div className="h-32 w-32 rounded-full border border-border bg-card/50 backdrop-blur-xl flex items-center justify-center relative z-10 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                  <CheckCircle2 className="h-12 w-12 text-blue-400 opacity-80" />
                </div>
              </motion.div>
              <h3 className="text-3xl font-black text-foreground mb-3 tracking-tight">Système Nominal</h3>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-8">
                Vous n'avez remonté aucune anomalie. L'intelligence artificielle d'OMEGA veille sur votre environnement.
              </p>
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} className="grid gap-5">
              <AnimatePresence>
                {tickets.map((ticket) => (
                  <motion.div key={ticket.id} variants={springCard} layout>
                    <div className={`bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group rounded-[2rem] relative overflow-hidden ${ticket.seminarUrgency ? 'bg-red-500/5 dark:bg-red-950/20 border-red-500/30' : ''}`}>
                      {ticket.seminarUrgency && ticket.status === 'open' && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]" />
                      )}
                      <div className="flex-1 min-w-0 pr-4 z-10">
                        <div className="flex items-center gap-3 mb-2.5">
                          {ticket.status === 'open' ? (
                            <div className="flex items-center gap-2">
                               <span className="relative flex h-2.5 w-2.5">
                                 <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ticket.seminarUrgency ? 'bg-red-400' : 'bg-blue-400'}`} />
                                 <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ticket.seminarUrgency ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`} />
                               </span>
                            </div>
                          ) : (
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                          )}
                          <h3 className="font-bold text-lg text-foreground truncate">{ticket.title}</h3>
                          {ticket.priority === 'high' && <Badge className="bg-orange-500/20 text-orange-400 border-none px-2 h-5 text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.2)]">Urgent</Badge>}
                          {ticket.seminarUrgency && <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 h-5 text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">Séminaire</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-2xl">
                          {ticket.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between shrink-0 gap-3 border-t border-border/50 md:border-t-0 pt-4 md:pt-0 z-10">
                        {ticket.status === 'open' ? (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${ticket.seminarUrgency ? 'bg-red-950/50 border-red-500/30 text-red-400' : 'bg-blue-950/30 border-blue-500/20 text-blue-400'}`}>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{ticket.seminarUrgency ? 'Critique' : 'En traitement IA'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-green-950/30 px-3 py-1.5 rounded-full border border-green-500/20 text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Résolu</span>
                          </div>
                        )}
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </main>

      <CommandMenu />
    </div>
  );
}
