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
import { PlusCircle, CheckCircle2, Zap, Clock, ShieldCheck, Monitor, Wifi, Lock, Cpu, Server, AlertTriangle, AlertCircle } from "lucide-react";

function formatTimeElapsed(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const elapsedMs = now.getTime() - date.getTime();
  
  const mins = Math.floor(elapsedMs / (60 * 1000));
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}


const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } } as const;

const springCard = { hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } } } as const;

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
    if ((user as any)?.email) {
      setFetching(true);
      const res = await getTickets((user as any).email);
      if (res.success) setTickets(res.tickets);
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        loadTickets();
      }
    }
  }, [user, role, loading, router, loadTickets]);

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

  if (!mounted || loading || !user || role !== "employee") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden text-foreground selection:bg-blue-500/30 page-wallpaper">
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
                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300">Portail Support</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 text-foreground">Tableau de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">bord</span></h1>
              <p className="text-muted-foreground text-sm">Visualisez vos incidents et suivez les actions IA en temps réel.</p>
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

                  <SmartTicketForm userEmail={(user as any).email as string} onSuccess={handleSuccess} />
                  
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
                {tickets.map((ticket) => {
                  const timeElapsed = formatTimeElapsed(ticket.submittedAt);
                  const isHigh = ticket.priority === 'high';
                  const isMedium = ticket.priority === 'medium';
                  const isLow = ticket.priority === 'low';
                  
                  return (
                    <motion.div key={ticket.id} variants={springCard} layout>
                      <div className={`bento-card p-5 flex flex-col gap-4 group rounded-2xl border transition-all relative overflow-hidden ${
                        ticket.seminarUrgency && ticket.status === 'open' 
                          ? 'bg-red-500/5 dark:bg-red-950/10 border-red-500/30' 
                          : 'bg-card/30 border-border/50 hover:border-primary/30'
                      }`}>
                        {ticket.seminarUrgency && ticket.status === 'open' && (
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                        )}
                        
                        {/* Header: ID, Submitter & Category */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-2.5 text-xs">
                          <div className="flex items-center gap-2 font-mono text-muted-foreground">
                            <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-foreground/80">#{ticket.id.substring(0, 8)}</span>
                            <span>•</span>
                            <span className="truncate max-w-[150px] sm:max-w-[250px]">{ticket.submittedBy}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-mono text-[11px]">{timeElapsed}</span>
                            <span className="text-muted-foreground/30">|</span>
                            <span className="flex items-center gap-1 bg-muted/50 border border-border/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                              {ticket.category === 'hardware' && <Monitor className="h-3 w-3 text-blue-400" />}
                              {ticket.category === 'network' && <Wifi className="h-3 w-3 text-purple-400" />}
                              {ticket.category === 'auth' && <Lock className="h-3 w-3 text-orange-400" />}
                              {ticket.category === 'software' && <Cpu className="h-3 w-3 text-pink-400" />}
                              {ticket.category === 'other' && <Server className="h-3 w-3 text-muted-foreground" />}
                              {ticket.category || 'autre'}
                            </span>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-base md:text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                            {ticket.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {ticket.description}
                          </p>
                        </div>

                        {/* Footer: Priority & Status */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-border/30 text-xs">
                          <div className="flex items-center gap-2">
                            {isHigh && (
                              <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                <AlertTriangle className="h-3 w-3" /> Urgent
                              </span>
                            )}
                            {isMedium && (
                              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                <AlertCircle className="h-3 w-3" /> Alerte
                              </span>
                            )}
                            {isLow && (
                              <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground border border-border/50 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider">
                                Standard
                              </span>
                            )}

                            {ticket.seminarUrgency && (
                              <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                                Séminaire
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {ticket.status === 'open' ? (
                              <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> En traitement
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Résolu
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

          )}
        </motion.div>
      </main>

      <CommandMenu />
    </div>
  );
}
