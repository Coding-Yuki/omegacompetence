"use client";

import { useEffect, useState, useMemo, startTransition, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AdminSidebar, SidebarNavItem } from "@/components/admin-sidebar";
import { getAllTickets, updateTicketStatus, assignTicket } from "@/app/actions";
import { CommandMenu } from "@/components/command-menu";
import { TicketDetailPanel } from "@/components/TicketDetailPanel";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, Search, Activity, Clock, CheckCircle2, AlertCircle, MoreVertical, LayoutGrid, Terminal, Monitor, Wifi, Lock, Cpu, Server, AlertTriangle, MessageSquare, XCircle, Construction } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_LABELS, STATUS_BADGE_COLORS } from "@/lib/constants";


const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const springCard = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
} as const;

const adminNavItems: readonly SidebarNavItem[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "tickets", label: "Tickets", icon: LayoutGrid },
  { id: "settings", label: "Settings", icon: Construction },
];

const sectionTitleMap: Record<string, string> = {
  overview: "Overview",
  tickets: "Tickets",
  settings: "Settings",
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
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [resolutionTargetStatus, setResolutionTargetStatus] = useState<string>("");
  const [resolutionTargetId, setResolutionTargetId] = useState<string>("");
  const [resolutionNote, setResolutionNote] = useState("");

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
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

  const openResolutionDialog = (id: string, newStatus: string) => {
    setResolutionTargetId(id);
    setResolutionTargetStatus(newStatus);
    setResolutionNote("");
    setResolutionDialogOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string, note?: string) => {
    startTransition(() => {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, resolutionNote: note ?? t.resolutionNote } : t));
    });
    try {
      const actorEmail = user?.email || "admin@omega.com";
      const res = await updateTicketStatus(id, newStatus, actorEmail, note);
      if (res.success && res.ticket) {
        toast.success("Mise à jour synchronisée", { description: "Le nœud réseau a bien été actualisé." });
        loadTickets();
      } else throw new Error();
    } catch {
      toast.error("Erreur de synchronisation", { description: "La requête a été rejetée." });
      loadTickets();
    }
  };

  const confirmResolution = () => {
    handleStatusChange(resolutionTargetId, resolutionTargetStatus, resolutionNote.trim() || undefined);
    setResolutionDialogOpen(false);
  };

  const handleAssign = async (ticketId: string) => {
    const adminEmail = user?.email;
    if (!adminEmail) return;
    startTransition(() => {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedTo: adminEmail } : t));
    });
    try {
      const res = await assignTicket(ticketId, adminEmail);
      if (res.success && res.ticket) {
        toast.success("Ticket pris en charge");
        loadTickets();
      } else throw new Error();
    } catch {
      toast.error("Erreur d'assignation");
      loadTickets();
    }
  };

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "open").length;
    const inProgress = tickets.filter(t => t.status === "in_progress").length;
    const resolved = tickets.filter(t => t.status === "resolved").length;
    const cannotResolve = tickets.filter(t => t.status === "cannot_resolve").length;
    const active = open + inProgress;
    const urgent = tickets.filter(t => t.status === "open" && t.priority === "high").length;
    const resolvedOrClosed = resolved + cannotResolve;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, open, inProgress, resolved, cannotResolve, active, urgent, resolvedOrClosed, resolutionRate };
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

  const allLogs = useMemo(() => {
    return tickets.flatMap(t => t.auditLogs || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
  }, [tickets]);

  const getSLA = (ticket: any) => {
    if (ticket.status === 'resolved' || ticket.status === 'cannot_resolve') return null;
    if (ticket.seminarUrgency) return { text: "URGENCE SÉMINAIRE", urgent: true };
    if (ticket.priority === 'high') {
      const submitted = new Date(ticket.submittedAt).getTime();
      const elapsed = currentTime - submitted;
      const limit = 2 * 60 * 60 * 1000;
      const remaining = limit - elapsed;
      if (remaining <= 0) return { text: "DÉLAI DÉPASSÉ", urgent: true };
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return { text: `${hours}h ${mins}m restants`, urgent: remaining < 15 * 60 * 1000 };
    }
    return null;
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (role !== "admin") {
    return null;
  }

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden text-foreground selection:bg-blue-500/30 page-wallpaper">
      <div className="mesh-bg">
        <div className="mesh-bg-gradient opacity-60 dark:opacity-100" />
        <div className="bg-grid-modern opacity-40 dark:opacity-60" />
      </div>

      <AdminSidebar
        navItems={adminNavItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className="flex-1 flex flex-col transition-all duration-300 ease-out"
        style={{ paddingLeft: sidebarWidth }}
      >
        <Navbar variant="minimal" sectionTitle={sectionTitleMap[activeSection] || "Tableau de bord"} />

        <main
          ref={mainRef}
          onMouseMove={handleMouseMove}
          className="flex-1 container mx-auto px-4 md:px-8 py-10 max-w-[1400px] relative z-10"
        >
          <motion.div variants={staggerContainer} initial="hidden" animate="show" key={activeSection}>

            {activeSection === "overview" && (
              <>
                <motion.div variants={springCard} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-2">Tableau de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">bord</span></h1>
                    <p className="text-muted-foreground text-sm max-w-md leading-relaxed">Gestion des incidents et audit trail.</p>
                  </div>
                </motion.div>

                {fetching && tickets.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-36 rounded-3xl bg-muted/50 animate-pulse border border-border/50" />)}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {[
                        { title: "Volume Global", icon: Activity, val: stats.total, color: "text-blue-400", glow: "border-blue-500/20 hover:border-blue-500/40 shadow-blue-950/20", desc: "Incidents totaux enregistrés" },
                        { title: "Flux Actifs", icon: AlertCircle, val: stats.active, color: "text-orange-400", glow: "border-orange-500/20 hover:border-orange-500/40 shadow-orange-950/20", desc: `${stats.open} ouverts, ${stats.inProgress} en cours` },
                        { title: "Anomalies Critiques", icon: Clock, val: stats.urgent, color: "text-red-500", glow: "border-red-500/25 hover:border-red-500/50 shadow-red-950/35", desc: "Hors délai ou Haute priorité" },
                        { title: "Résolution Globale", icon: CheckCircle2, val: `${stats.resolutionRate}%`, color: "text-green-400", glow: "border-green-500/20 hover:border-green-500/40 shadow-green-950/20", desc: `${stats.resolved} résolus, ${stats.cannotResolve} hors périmètre` }
                      ].map((stat, i) => (
                        <motion.div key={i} variants={springCard}>
                          <Card className={`bento-card h-full border rounded-2xl overflow-hidden bg-card/40 backdrop-blur-xl transition-all duration-300 ${stat.glow} shadow-xl hover:-translate-y-1 flex flex-col justify-between`}>
                            <CardHeader className="pb-1 pt-5 px-5">
                              <CardTitle className={`text-xs font-bold ${stat.color} uppercase tracking-widest flex items-center justify-between`}>
                                <span className="flex items-center gap-2">
                                  <stat.icon className="h-4 w-4" />
                                  {stat.title}
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-5 px-5 flex-1">
                              <div className="text-4xl font-extrabold text-foreground tracking-tight mb-2">{stat.val}</div>
                              <p className="text-xs text-muted-foreground font-medium">{stat.desc}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                      <motion.div variants={springCard} className="lg:col-span-2">
                        <Card className="bento-card h-full flex flex-col rounded-[2rem] overflow-hidden">
                          <CardHeader className="border-b border-border/50 pb-5">
                            <CardTitle className="text-sm font-bold text-foreground">Statistiques du Système</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">Analyse sur 7 jours.</CardDescription>
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

                      <motion.div variants={springCard}>
                        <Card className="bento-card h-full flex flex-col rounded-[2rem] overflow-hidden">
                          <CardHeader className="border-b border-border/50 pb-4 bg-muted/30">
                            <CardTitle className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                              <Terminal className="h-4 w-4" /> Journal d'audit
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 overflow-hidden flex-1 relative">
                            <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700">
                              {allLogs.length === 0 ? (
                                <div className="text-xs text-muted-foreground font-mono">Aucun log système disponible.</div>
                              ) : (
                                allLogs.map((log: any, i: number) => (
                                  <div key={i} className="font-mono text-[10px] sm:text-xs">
                                    <span className="text-muted-foreground/60">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                                    <span className="text-blue-500 dark:text-blue-400 font-bold">{log.action}</span>{" "}
                                    <span className="text-muted-foreground/80">by</span>{" "}
                                    <span className="text-amber-600 dark:text-orange-300">{log.actorEmail.split('@')[0]}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeSection === "tickets" && (
              <>
                <motion.div variants={springCard} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-2">Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">tickets</span></h1>
                    <p className="text-muted-foreground text-sm max-w-md leading-relaxed">Recherchez, filtrez et gérez les incidents.</p>
                  </div>
                </motion.div>

                <motion.div variants={springCard} className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both" style={{ animationDelay: '200ms' }}>
                  <Card className="bento-card rounded-[2rem] overflow-hidden">
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
                          <SelectItem value="open">Ouverts</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="resolved">Résolus</SelectItem>
                          <SelectItem value="cannot_resolve">Non résolubles</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val || "all")}>
                        <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/50 border-border text-foreground rounded-xl">
                          <SelectValue placeholder="Toutes les priorités" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                          <SelectItem value="all">Toutes priorités</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
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
                      <div className="overflow-x-auto rounded-3xl border border-border/30 bg-card/30 shadow-inner">
                        <table className="w-full min-w-full text-sm text-left">
                          <thead className="bg-muted/25 border-b border-border/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                            <tr>
                              <th className="px-6 py-5">Entité &amp; Signature</th>
                              <th className="px-6 py-5">Catégorie</th>
                              <th className="px-6 py-5">Délai / Priorité</th>
                              <th className="px-6 py-5">État</th>
                              <th className="px-6 py-5">Assignation</th>
                              <th className="px-6 py-5">Date et heure</th>
                              <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <motion.tbody
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-border/50 bg-transparent"
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
                                    onClick={() => { setSelectedTicket(ticket); setIsPanelOpen(true); }}
                                    className={`group hover:bg-muted/40 transition-colors duration-300 relative cursor-pointer ${isUrgentSLA ? 'bg-red-500/5 dark:bg-red-950/10' : ''}`}
                                  >
                                    <td className={`absolute left-0 top-0 bottom-0 w-[2px] transition-opacity duration-300 ${isUrgentSLA ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] opacity-100' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`} />

                                    <td className="px-6 py-5 font-medium">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-foreground truncate max-w-[280px] font-semibold text-sm">{ticket.title}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{ticket.submittedBy.split('@')[0]}</span>
                                      </div>
                                    </td>

                                    <td className="px-6 py-5">
                                      <span className="flex items-center gap-1.5 w-fit bg-muted/40 border border-border/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-foreground/75 font-mono">
                                        {ticket.category === 'hardware' && <Monitor className="h-3.5 w-3.5 text-blue-400" />}
                                        {ticket.category === 'network' && <Wifi className="h-3.5 w-3.5 text-purple-400" />}
                                        {ticket.category === 'auth' && <Lock className="h-3.5 w-3.5 text-orange-400" />}
                                        {ticket.category === 'software' && <Cpu className="h-3.5 w-3.5 text-pink-400" />}
                                        {ticket.category === 'other' && <Server className="h-3.5 w-3.5 text-muted-foreground" />}
                                        {ticket.category || 'autre'}
                                      </span>
                                    </td>

                                    <td className="px-6 py-5">
                                      <div className="flex flex-col gap-1 items-start">
                                        {ticket.priority === 'high' && (
                                          <Badge className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/25 border border-orange-500/20 px-2 h-5 text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(249,115,22,0.15)]">
                                            <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Urgent
                                          </Badge>
                                        )}
                                        {ticket.priority === 'medium' && (
                                          <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 px-2 h-5 text-[9px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                                            <AlertCircle className="h-2.5 w-2.5 mr-1" /> Alerte
                                          </Badge>
                                        )}
                                        {ticket.priority === 'low' && (
                                          <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border border-border/50 px-2 h-5 text-[9px] font-medium uppercase tracking-widest">
                                            Standard
                                          </Badge>
                                        )}

                                        {sla && (
                                          <span className={`text-[10px] font-mono font-bold mt-1 ${isUrgentSLA ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`}>
                                            {sla.text}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    <td className="px-6 py-5">
                                      {(() => {
                                        const c = STATUS_BADGE_COLORS[ticket.status] || STATUS_BADGE_COLORS.open;
                                        return (
                                          <span className={`inline-flex items-center gap-1.5 ${c.bg} ${c.text} ${c.border} px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} /> {STATUS_LABELS[ticket.status] || "Ouvert"}
                                          </span>
                                        );
                                      })()}
                                    </td>

                                    <td className="px-6 py-5">
                                      {ticket.assignedTo ? (
                                        ticket.assignedTo === user?.email ? (
                                          <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            Vous
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 bg-muted border border-border/50 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                            pris en charge par {ticket.assignedTo.split('@')[0]}
                                          </span>
                                        )
                                      ) : (
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAssign(ticket.id);
                                          }}
                                          size="xs"
                                          variant="outline"
                                          className="text-[10px] font-bold uppercase tracking-wider px-2 h-7 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 rounded-lg cursor-pointer"
                                        >
                                          Prendre en charge
                                        </Button>
                                      )}
                                    </td>

                                    <td className="px-6 py-5">
                                      <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                                        {new Date(ticket.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </td>

                                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-300 focus:opacity-100 inline-flex items-center justify-center cursor-pointer shadow-sm border border-transparent hover:border-border">
                                            <MoreVertical className="h-4 w-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[220px] bg-popover/90 backdrop-blur-xl border-border text-popover-foreground shadow-2xl rounded-xl p-2">
                                          {(ticket.status === 'open' || ticket.status === 'in_progress') ? (
                                            <>
                                              <DropdownMenuItem
                                                className="text-green-500 focus:bg-green-500/10 rounded-lg cursor-pointer text-xs font-bold py-2.5 mb-1"
                                                onClick={() => openResolutionDialog(ticket.id, 'resolved')}
                                              >
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Marquer comme résolu
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className="text-zinc-400 focus:bg-zinc-500/10 rounded-lg cursor-pointer text-xs font-bold py-2.5"
                                                onClick={() => openResolutionDialog(ticket.id, 'cannot_resolve')}
                                              >
                                                <XCircle className="mr-2 h-4 w-4" /> Non résoluble
                                              </DropdownMenuItem>
                                            </>
                                          ) : (
                                            <DropdownMenuItem
                                              className="text-orange-500 focus:bg-orange-500/10 rounded-lg cursor-pointer text-xs font-bold py-2.5 mb-1"
                                              onClick={() => handleStatusChange(ticket.id, 'open')}
                                            >
                                              <AlertCircle className="mr-2 h-4 w-4" /> Réouvrir
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
                </motion.div>
              </>
            )}

            {activeSection === "settings" && (
              <motion.div variants={springCard} className="flex flex-col items-center justify-center py-32 text-center">
                <div className="h-24 w-24 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-6">
                  <Construction className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight mb-3">Paramètres</h2>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  Cette section est en cours de développement. Revenez bientôt pour personnaliser les préférences système.
                </p>
              </motion.div>
            )}

          </motion.div>
        </main>
      </div>

      <Dialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
        <DialogContent className="sm:max-w-md bg-popover/95 backdrop-blur-3xl border-border text-popover-foreground shadow-2xl rounded-2xl p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              {resolutionTargetStatus === 'resolved' ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-zinc-400" />
              )}
              {resolutionTargetStatus === 'resolved' ? 'Marquer comme résolu' : 'Marquer comme non résoluble'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Note de résolution (optionnelle).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={resolutionTargetStatus === 'resolved'
              ? "Comment le problème a été résolu…"
              : "Pourquoi le ticket ne peut pas être résolu…"}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            className="min-h-[100px] bg-background/50 border-border text-foreground rounded-xl resize-none"
          />
          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setResolutionDialogOpen(false)}
              className="inline-flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted border border-border/50 px-4 py-2 text-sm font-semibold text-foreground transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={confirmResolution}
              className="inline-flex items-center justify-center rounded-xl bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              Confirmer
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <CommandMenu />
      <TicketDetailPanel
        ticket={selectedTicket}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        currentUserEmail={user?.email}
      />
    </div>
  );
}
