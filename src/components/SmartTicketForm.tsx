"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { createTicket } from "@/app/actions";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { toast } from "sonner";
import { 
  Send, Sparkles, AlertTriangle, Monitor, Wifi, Lock, Cpu, Lightbulb, CheckCircle2, Server
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const smartTicketSchema = z.object({
  title: z.string().min(5, "Titre trop court"),
  description: z.string().min(10, "Description trop courte"),
  priority: z.enum(["low", "medium", "high"]),
  category: z.string(),
  seminarUrgency: z.boolean(),
});

type SmartTicketInput = z.infer<typeof smartTicketSchema>;

const KEYWORDS = {
  hardware: ["écran", "souris", "clavier", "allume plus", "pc", "ordinateur", "imprimante", "casque"],
  network: ["vpn", "wifi", "internet", "connexion", "latence", "ping", "déconnecté"],
  auth: ["mot de passe", "bloqué", "accès", "login", "authentification", "compte"],
  software: ["erp", "office", "excel", "crash", "bug", "logiciel", "mise à jour"]
};

const DEFLECTION_SOLUTIONS: Record<string, { title: string, steps: string[] }> = {
  vpn: {
    title: "Problème VPN détecté",
    steps: ["Redémarrez Cisco AnyConnect", "Vérifiez que vous êtes sur le réseau OMEGA-SERVER-01", "Si le profil est bloqué, attendez 15 min avant de réessayer"]
  },
  imprimante: {
    title: "Souci d'impression",
    steps: ["Vérifiez le bourrage papier (Bac 2)", "Assurez-vous d'être sur le même réseau WiFi que l'imprimante", "Relancez le spooler d'impression Windows"]
  },
  "mot de passe": {
    title: "Réinitialisation d'accès",
    steps: ["Utilisez le portail en libre-service password.omega.com", "Vérifiez vos spams pour le code PIN"]
  }
};

export function SmartTicketForm({ userEmail, onSuccess }: { userEmail: string, onSuccess: () => void }) {
  const { isOnline } = useNetworkStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [deflectionKey, setDeflectionKey] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<SmartTicketInput>({
    resolver: zodResolver(smartTicketSchema),
    defaultValues: { title: "", description: "", priority: "low", category: "other", seminarUrgency: false },
  });

  const description = watch("description");

  // NLP: Auto-catégorisation et Ticket Deflection
  useEffect(() => {
    if (!description) {
      setSuggestedCategory(null);
      setDeflectionKey(null);
      return;
    }

    const lowerDesc = description.toLowerCase();
    
    // Auto-category
    let foundCategory = null;
    for (const [cat, words] of Object.entries(KEYWORDS)) {
      if (words.some(w => lowerDesc.includes(w))) {
        foundCategory = cat;
        break;
      }
    }
    
    if (foundCategory) {
      setSuggestedCategory(foundCategory);
      setValue("category", foundCategory);
    } else {
      setSuggestedCategory(null);
    }

    // Ticket deflection
    let foundDeflection = null;
    for (const key of Object.keys(DEFLECTION_SOLUTIONS)) {
      if (lowerDesc.includes(key)) {
        foundDeflection = key;
        break;
      }
    }
    setDeflectionKey(foundDeflection);

  }, [description, setValue]);

  async function onSubmit(data: SmartTicketInput) {
    if (!isOnline) {
      toast.error("Mode Hors-Ligne", { description: "Impossible d'envoyer le ticket sans réseau." });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createTicket(data, userEmail);
      if (res.success) {
        toast.success("Anomalie signalée", { description: "Le système Neural Core a pris en charge votre requête." });
        reset();
        onSuccess();
      } else {
        toast.error("Erreur système", { description: res.error });
      }
    } catch {
      toast.error("Erreur critique", { description: "Échec de la communication." });
    }
    setIsSubmitting(false);
  }

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {isFocused && isOnline && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute -inset-6 bg-background/40 backdrop-blur-[1px] z-[5] pointer-events-none rounded-[2rem]"
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10 bg-card/30 border border-border/50 p-6 md:p-8 rounded-3xl">
        
        {/* Section 1: Informations Générales */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">1. Informations Générales</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
              <Label htmlFor="title" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Sujet principal</Label>
              <Input 
                id="title" 
                placeholder="Ex: Latence réseau au 3ème étage" 
                {...register("title")} 
                className="bg-background/40 border-border text-foreground focus:border-blue-500 rounded-xl h-11 text-sm transition-all duration-300"
              />
              {errors.title && <p className="text-[10px] text-red-500 font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center justify-between">
                <span>Catégorie</span>
                <AnimatePresence>
                  {suggestedCategory && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="text-green-400 flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider"
                    >
                      <Sparkles className="h-3 w-3" /> IA Suggérée
                    </motion.span>
                  )}
                </AnimatePresence>
              </Label>
              <Select 
                value={watch("category")} 
                onValueChange={(val) => setValue("category", val ?? "other")}
              >
                <SelectTrigger className={`bg-background/40 text-foreground border-border rounded-xl h-11 text-sm transition-all duration-300 ${suggestedCategory ? 'border-green-500/50' : ''}`}>
                  <SelectValue placeholder="Catégorie..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl shadow-2xl">
                  <SelectItem value="hardware"><div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-blue-400"/> Matériel</div></SelectItem>
                  <SelectItem value="network"><div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-purple-400"/> Réseau & VPN</div></SelectItem>
                  <SelectItem value="auth"><div className="flex items-center gap-2"><Lock className="h-4 w-4 text-orange-400"/> Authentification</div></SelectItem>
                  <SelectItem value="software"><div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-pink-400"/> Logiciel / ERP</div></SelectItem>
                  <SelectItem value="other"><div className="flex items-center gap-2"><Server className="h-4 w-4 text-muted-foreground"/> Autre</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <hr className="border-border/30" />

        {/* Section 2: Diagnostic Technique */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">2. Diagnostic Technique</h4>
          <div className="space-y-2" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
            <Label htmlFor="description" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Description détaillée</Label>
            <Textarea 
              id="description" 
              placeholder="Décrivez l'anomalie en détail..." 
              {...register("description")} 
              className="bg-background/40 border-border text-foreground focus:border-blue-500 rounded-xl min-h-[100px] text-sm resize-none transition-all duration-300"
            />
            {errors.description && <p className="text-[10px] text-red-500 font-medium">{errors.description.message}</p>}
          </div>

          {/* Ticket Deflection Card */}
          <AnimatePresence>
            {deflectionKey && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 15 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 15 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 backdrop-blur-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <span>💡 Solution Rapide Suggérée</span>
                  </div>
                  <h4 className="text-foreground font-bold text-xs">{DEFLECTION_SOLUTIONS[deflectionKey].title}</h4>
                  <ul className="space-y-1">
                    {DEFLECTION_SOLUTIONS[deflectionKey].steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-blue-100/70">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <hr className="border-border/30" />

        {/* Section 3: Impact & Urgence */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">3. Impact & Urgence</h4>
          
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Criticité / Impact Métier</Label>
              <Select onValueChange={(val) => setValue("priority", (val || "low") as any)} defaultValue="low">
                <SelectTrigger className="bg-background/40 border-border text-foreground rounded-xl h-11 text-sm transition-all duration-300">
                  <SelectValue placeholder="Évaluer l'impact..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl shadow-2xl">
                  <SelectItem value="low">Standard (Gênant mais non bloquant)</SelectItem>
                  <SelectItem value="medium">Alerte (Impact partiel sur la prod)</SelectItem>
                  <SelectItem value="high">Critique (Blocage total du système)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggle Séminaire (Premium Priority) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/10 border border-red-500/10 group hover:border-red-500/20 transition-colors h-16 mt-6 md:mt-0">
              <div className="flex flex-col pr-2">
                <Label className="flex items-center gap-1.5 text-red-400 font-extrabold tracking-widest uppercase text-[9px]">
                  <AlertTriangle className="h-3.5 w-3.5" /> Urgence Séminaire
                </Label>
                <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                  Formation OMEGA en cours.
                </span>
              </div>
              <Switch 
                onCheckedChange={(checked) => setValue("seminarUrgency", checked)} 
                className="data-[state=checked]:bg-red-500 scale-90"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button 
            type="submit" 
            disabled={isSubmitting || !isOnline} 
            className="group neo-button w-full sm:w-auto bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-bold px-8 h-11 text-sm shadow-md transition-all border-none cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center"><div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Transmission...</span>
            ) : (
              <span className="flex items-center"><Send className="mr-2 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> Émettre la requête</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

