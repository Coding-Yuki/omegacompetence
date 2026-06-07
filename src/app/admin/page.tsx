"use client";

import { useEffect, useState, useMemo, startTransition, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getAllTickets, updateTicketStatus } from "@/app/actions";
import { CommandMenu } from "@/components/command-menu";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, Search, Activity, Clock, CheckCircle2, AlertCircle, MoreVertical, LayoutGrid, Terminal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const springCard = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const mainRef = useRef<HTMLElement>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => { 
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000); // Update every minute for SLA
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/");
      else if (role !== "admin") router.push("/my-tickets");
      else loadTickets();
    }
  }, [user, role, authLoading, router]);

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

  async function loadTickets() {
    setFetching(true);
    const res = await getAllTickets();
    if (res.success) setTickets(res.tickets);
    setFetching(false);
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title?.toLowerCase().includes(search.toLowerCase()) || ticket.id?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    startTransition(() => {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    });
    try {
      const actorEmail = user?.email || "admin@omega.com";
      const res = await updateTicketStatus(id, newStatus, actorEmail);
      if (res.success && res.ticket) {
        toast.success("Mise à jour synchronisée", { description: "Le nœud réseau a bien été actualisé." });
        loadTickets(); // Refresh to get the latest audit logs
      } else throw new Error();
    } catch {
      toast.error("Erreur de synchronisation", { description: "La requête a été rejetée." });
      loadTickets();
    }
  };

  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === "resolved").length;
    const open = tickets.filter(t => t.status === "open").length;
    const urgent = tickets.filter(t => t.status === "open" && t.priority === "high").length;
    return { total, resolved, open, urgent };
  }, [tickets]);

  const chartData = useMemo(() => {
    if (tickets.length === 0) return [];
    const groups: Record<string, { created: number; resolved: number }> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      groups[d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })] = { created: 0, resolved: 0 };
    }
    tickets.forEach(t => {
      const dateStr = new Date(t.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      if (groups[dateStr]) {
        groups[dateStr].created += 1;
        if (t.status === "resolved") groups[dateStr].resolved += 1;
      }
    });
    return Object.entries(groups).map(([name, data]) => ({ name, ...data }));
  }, [tickets]);

  // Extract all audit logs for the terminal
  const allLogs = useMemo(() => {
    return tickets.flatMap(t => t.auditLogs || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
  }, [tickets]);

  const getSLA = (ticket: any) => {
    if (ticket.status !== 'open') return null;
    if (ticket.seminarUrgency) return { text: "URGENCE SÉMINAIRE", urgent: true };
    if (ticket.priority === 'high') {
      const submitted = new Date(ticket.submittedAt).getTime();
      const elapsed = currentTime - submitted;
      const limit = 2 * 60 * 60 * 1000; // 2 hours SLA
      const remaining = limit - elapsed;
      if (remaining <= 0) return { text: "SLA DÉPASSÉ", urgent: true };
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return { 
        text: `${hours}h ${mins}m restants`, 
        urgent: remaining < 15 * 60 * 1000 // < 15 mins
      };
    }
    return null;
  };

  if (!mounted || authLoading || (user && role !== "admin")) return <div className="min-h-screen bg-zinc-950" />;

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
        className="flex-1 container mx-auto px-4 md:px-8 py-10 max-w-[1400px] relative z-10"
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          
          <motion.div variants={springCard} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <LayoutGrid className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300">Command Level</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-2">Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Core</span></h1>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">Supervision IA des incidents et audit trail certifié ISO.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono hidden sm:inline-block border border-border px-3 py-1.5 rounded-lg bg-muted/50">
                Press <kbd className="font-sans font-bold text-foreground mx-1">Ctrl+K</kbd> for Command Palette
              </span>
            </div>
          </motion.div>

          {fetching && tickets.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-36 rounded-3xl bg-muted/50 animate-pulse border border-border/50" />)}
            </div>
          ) : (
            <>
              {/* KPIs Bento */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { title: "Volume Global", icon: Activity, val: stats.total, color: "text-blue-400" },
                  { title: "Flux Actifs", icon: AlertCircle, val: stats.open, color: "text-orange-400" },
                  { title: "Anomalies Critiques", icon: Clock, val: stats.urgent, color: "text-red-500" },
                  { title: "Nœuds Résolus", icon: CheckCircle2, val: stats.resolved, color: "text-green-400" }
                ].map((stat, i) => (
                  <motion.div key={i} variants={springCard}>
                    <Card className="bento-card rounded-[2rem] overflow-hidden">
                      <CardHeader className="pb-2 pt-6">
                        <CardTitle className={`text-[11px] font-bold ${stat.color} uppercase tracking-widest flex items-center gap-2`}>
                          <stat.icon className="h-4 w-4" /> {stat.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <div className="text-5xl font-black text-foreground tracking-tighter drop-shadow-lg">{stat.val}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Graphique Bento */}
                <motion.div variants={springCard} className="lg:col-span-2">
                  <Card className="bento-card h-full flex flex-col rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-border/50 pb-5">
                      <CardTitle className="text-sm font-bold text-foreground">Télémétrie du Système</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">Analyse de charge sur 7 jours.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 flex-1 min-h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '1rem' }}
                            itemStyle={{ color: 'var(--popover-foreground)', fontSize: '13px', fontWeight: 600 }}
                            labelStyle={{ color: 'var(--muted-foreground)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}
                          />
                          <Area type="monotone" dataKey="created" name="Requêtes" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCreated)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Audit Trail Terminal Bento */}
                <motion.div variants={springCard}>
                  <Card className="bento-card h-full flex flex-col rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-border/50 pb-4 bg-muted/30">
                      <CardTitle className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="h-4 w-4" /> Secure Audit Trail
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-hidden flex-1 relative">
                      <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700">
                        {allLogs.length === 0 ? (
                          <div className="text-xs text-muted-foreground font-mono">Aucun log système disponible.</div>
                        ) : (
                          allLogs.map((log, i) => (
                            <div key={i} className="font-mono text-[10px] sm:text-xs">
                              <span className="text-muted-foreground/60">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                              <span className="text-blue-500 dark:text-blue-400 font-bold">{log.action}</span>{" "}
                              <span className="text-muted-foreground/80">by</span>{" "}
                              <span className="text-amber-600 dark:text-orange-300">{log.actorEmail.split('@')[0]}</span>{" "}
                              <span className="text-muted-foreground/50">({log.ticketId.substring(0, 8)})</span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Filtres & Tableau */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both" style={{ animationDelay: '200ms' }}>
                <Card className="bento-card rounded-[2rem] overflow-hidden">
                  
                  {/* Filters Bar */}
                  <div className="p-6 border-b border-border/50 flex flex-col md:flex-row gap-4 bg-muted/20">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher UID, Titre..." 
                        className="pl-10 h-11 bg-background/50 border-border text-foreground rounded-xl focus:border-blue-500 transition-all animate-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
                      <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/50 border-border text-foreground rounded-xl">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                        <SelectItem value="all">Tous les états</SelectItem>
                        <SelectItem value="open">Anomalies Actives</SelectItem>
                        <SelectItem value="resolved">Noeuds Réparés</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val || "all")}>
                      <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/50 border-border text-foreground rounded-xl">
                        <SelectValue placeholder="Toutes les priorités" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                        <SelectItem value="all">Toutes criticités</SelectItem>
                        <SelectItem value="high">Alerte Rouge</SelectItem>
                        <SelectItem value="medium">Avertissement</SelectItem>
                        <SelectItem value="low">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredTickets.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                      <ShieldCheck className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                      <h3 className="text-xl font-bold text-foreground mb-2">Aucun Résultat</h3>
                      <p className="text-sm text-muted-foreground max-w-[300px]">Aucune anomalie ne correspond à cette matrice de filtrage.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 border-b border-border/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                          <tr>
                            <th className="px-6 py-5">Entité & Signature</th>
                            <th className="px-6 py-5">Catégorie</th>
                            <th className="px-6 py-5">SLA / Criticité</th>
                            <th className="px-6 py-5">État</th>
                            <th className="px-6 py-5">Horodatage</th>
                            <th className="px-6 py-5 text-right">Contrôle</th>
                          </tr>
                        </thead>
                        <motion.tbody 
                          variants={staggerContainer}
                          initial="hidden"
                          animate="show"
                          className="divide-y divide-border/50"
                        >
                          <AnimatePresence>
                            {filteredTickets.map((ticket) => {
                              const sla = getSLA(ticket);
                              const isUrgentSLA = sla?.urgent;
                              
                              return (
                                <motion.tr 
                                  key={ticket.id}
                                  variants={springCard}
                                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                  className={`group hover:bg-muted/40 transition-colors duration-300 relative ${isUrgentSLA ? 'bg-red-500/5 dark:bg-red-950/10' : ''}`}
                                >
                                  <td className={`absolute left-0 top-0 bottom-0 w-[2px] transition-opacity duration-300 ${isUrgentSLA ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] opacity-100' : 'bg-blue-500 opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`} />
                                  
                                  <td className="px-6 py-5 font-medium">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-foreground truncate max-w-[280px] font-semibold text-sm">{ticket.title}</span>
                                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{ticket.id.substring(0, 8)} • {ticket.submittedBy.split('@')[0]}</span>
                                    </div>
                                  </td>

                                  <td className="px-6 py-5">
                                    <Badge variant="outline" className="border-border text-muted-foreground bg-muted/50 uppercase text-[9px] tracking-widest">
                                      {ticket.category || "other"}
                                    </Badge>
                                  </td>
                                  
                                  <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1.5 items-start">
                                      {ticket.priority === 'high' && <Badge className="bg-orange-500/10 text-orange-400 border-none px-2 h-5 text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(249,115,22,0.15)]">Urgent</Badge>}
                                      {ticket.priority === 'medium' && <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none shadow-[0_0_10px_rgba(59,130,246,0.15)]">Alerte</Badge>}
                                      {ticket.priority === 'low' && <Badge variant="outline" className="border-border text-muted-foreground bg-transparent">Normale</Badge>}
                                      
                                      {sla && (
                                        <span className={`text-[10px] font-mono font-bold ${isUrgentSLA ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`}>
                                          {sla.text}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="px-6 py-5">
                                    {ticket.status === 'open' ? (
                                      <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        </span>
                                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Actif</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                        <span className="text-[11px] font-bold text-green-400 uppercase tracking-widest">Résolu</span>
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5">
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                      <Clock className="h-3 w-3" />
                                      {new Date(ticket.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </td>

                                  <td className="px-6 py-5 text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center justify-center cursor-pointer shadow-sm border border-transparent hover:border-border">
                                          <MoreVertical className="h-4 w-4" />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-[180px] bg-popover/90 backdrop-blur-xl border-border text-popover-foreground shadow-2xl rounded-xl p-2">
                                        {ticket.status === 'open' ? (
                                          <DropdownMenuItem 
                                            className="text-green-500 focus:bg-green-500/10 rounded-lg cursor-pointer text-xs font-bold py-2.5 mb-1"
                                            onClick={() => handleStatusChange(ticket.id, 'resolved')}
                                          >
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Purger l'anomalie
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem 
                                            className="text-orange-500 focus:bg-orange-500/10 rounded-lg cursor-pointer text-xs font-bold py-2.5 mb-1"
                                            onClick={() => handleStatusChange(ticket.id, 'open')}
                                          >
                                            <AlertCircle className="mr-2 h-4 w-4" /> Réactiver le flux
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </AnimatePresence>
                        </motion.tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </motion.div>
      </main>
      
      <CommandMenu />
    </div>
  );
}
