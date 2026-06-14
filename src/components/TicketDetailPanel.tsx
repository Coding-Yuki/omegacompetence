"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Clock, User, FileText, CheckCircle2, AlertCircle, AlertTriangle, 
  Zap, ShieldCheck, Monitor, Wifi, Lock, Cpu, Server, Activity 
} from "lucide-react";
import { getAuditLogs } from "@/app/actions";
import { Badge } from "@/components/ui/badge";

interface TicketDetailPanelProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
}

function formatLogAction(action: string) {
  if (action === "TICKET_CREATED") return "Ticket créé";
  if (action === "TICKET_ASSIGNED") return "Ticket pris en charge";
  if (action.startsWith("STATUS_CHANGED_")) {
    const status = action.replace("STATUS_CHANGED_", "").toLowerCase();
    return status === "resolved" ? "Marqué comme résolu" : "Réouvert";
  }
  return action;
}

export function TicketDetailPanel({ ticket, isOpen, onClose, currentUserEmail }: TicketDetailPanelProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      setLoadingLogs(true);
      getAuditLogs(ticket.id).then((res) => {
        if (res.success) {
          setLogs(res.logs || []);
        }
        setLoadingLogs(false);
      }).catch(() => {
        setLoadingLogs(false);
      });
    } else {
      setLogs([]);
    }
  }, [isOpen, ticket?.id]);

  if (!ticket) return null;

  const isHigh = ticket.priority === 'high';
  const isMedium = ticket.priority === 'medium';
  const isLow = ticket.priority === 'low';

  const categoryIcons: Record<string, any> = {
    hardware: Monitor,
    network: Wifi,
    auth: Lock,
    software: Cpu,
    other: Server,
  };
  const CategoryIcon = categoryIcons[ticket.category] || Server;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/40 backdrop-blur-[4px] z-50 cursor-pointer"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg md:max-w-xl bg-popover/95 backdrop-blur-3xl border-l border-border/50 shadow-2xl z-50 flex flex-col h-full overflow-hidden text-foreground"
          >
            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-muted/10 shrink-0">
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
                Fiche d'incident
              </span>
              <button
                onClick={onClose}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-zinc-700">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-snug">
                  {ticket.title}
                </h2>

                <div className="flex flex-wrap gap-2 pt-1">
                  {ticket.status === 'open' ? (
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Résolu
                    </span>
                  )}

                  {isHigh && (
                    <Badge className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[0_0_10px_rgba(249,115,22,0.15)]">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Critique
                    </Badge>
                  )}
                  {isMedium && (
                    <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" /> Alerte
                    </Badge>
                  )}
                  {isLow && (
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border border-border/50 px-3 py-1 text-xs font-medium uppercase tracking-wider">
                      Standard
                    </Badge>
                  )}

                  {ticket.seminarUrgency && (
                    <span className="inline-flex items-center gap-1.5 bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                      Séminaire
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-border/30" />

              <div className="grid grid-cols-2 gap-6 bg-muted/10 p-5 rounded-2xl border border-border/30 text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block">Catégorie</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CategoryIcon className="h-4 w-4 text-primary" />
                    <span className="capitalize">{ticket.category || "autre"}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block">Soumis Par</span>
                  <span className="font-semibold text-foreground truncate block font-mono text-xs">
                    {ticket.submittedBy}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block">Date d'émission</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {new Date(ticket.submittedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block">Assigné à</span>
                  {ticket.assignedTo ? (
                    ticket.assignedTo === currentUserEmail ? (
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Vous
                      </span>
                    ) : (
                      <span className="font-semibold text-foreground truncate block font-mono text-xs text-muted-foreground">
                        {ticket.assignedTo.split('@')[0]}
                      </span>
                    )
                  ) : (
                    <span className="font-medium text-muted-foreground italic text-xs">
                      Non assigné
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Description de l'anomalie
                </h4>
                <div className="bg-card/40 border border-border/50 p-5 rounded-2xl text-sm leading-relaxed text-foreground/90 whitespace-pre-line select-text">
                  {ticket.description}
                </div>
              </div>

              <hr className="border-border/30" />

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Historique d'audit (Audit Trail)
                </h4>
                
                {loadingLogs ? (
                  <div className="space-y-3 pt-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 w-full rounded-xl bg-muted/40 animate-pulse border border-border/30" />
                    ))}
                  </div>
                ) : logs.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-mono">Aucune trace d'audit enregistrée.</p>
                ) : (
                  <div className="relative border-l border-border/50 pl-4 ml-2 space-y-6 pt-2">
                    {logs.map((log) => {
                      const isCreated = log.action === "TICKET_CREATED";
                      const isAssigned = log.action === "TICKET_ASSIGNED";
                      
                      return (
                        <div key={log.id} className="relative text-xs">
                          <span className={`absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full border-2 bg-popover flex items-center justify-center ${
                            isCreated ? "border-blue-500" : isAssigned ? "border-purple-500" : "border-green-500"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              isCreated ? "bg-blue-500" : isAssigned ? "bg-purple-500" : "bg-green-500"
                            }`} />
                          </span>
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">
                              {formatLogAction(log.action)}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span>par {log.actorEmail}</span>
                              <span className="text-muted-foreground/30">•</span>
                              <span>
                                {new Date(log.timestamp).toLocaleString('fr-FR', {
                                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
