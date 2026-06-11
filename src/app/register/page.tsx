"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerUser, loginUser, logoutUser } from "@/app/actions";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { UserPlus, ArrowRight, Loader2, ShieldCheck, Mail, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenerativeAvatar } from "@/components/GenerativeAvatar";
import { HoloLock } from "@/components/HoloLock";
import { AuroraBackground } from "@/components/AuroraBackground";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [showRipple, setShowRipple] = useState(false);
  const hasRedirectedRef = useRef(false);

  // Redirect already authenticated users to their dashboard
  useEffect(() => {
    // Guard: prevent multiple redirects
    if (hasRedirectedRef.current) return;
    
    if (!loading && user && role) {
      hasRedirectedRef.current = true;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "employee") {
        router.push("/my-tickets");
      }
    }
  }, [user, role, loading, router]);

  const { register, handleSubmit, watch, formState: { errors }, setError, reset } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", adminCode: "" },
  });

  const watchFullName = watch("fullName");
  const watchPassword = watch("password");
  const watchConfirm = watch("confirmPassword");

  // Magnetic 3D effect for the card
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 100 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const rotateX = useTransform(springY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Password evaluation
  useEffect(() => {
    let score = 0;
    if (watchPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(watchPassword)) score += 1;
    if (/[0-9]/.test(watchPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(watchPassword)) score += 1;
    setPasswordScore(watchPassword ? score : 0);

    if (score >= 3 && watchPassword === watchConfirm && watchConfirm.length > 0) {
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [watchPassword, watchConfirm]);

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    try {
      // Validate admin code BEFORE creating account
      const ADMIN_SECRET_CODE = "OMEGA-COMPETENCE-2026";
      const trimmedCode = data.adminCode?.trim();
      if (trimmedCode && trimmedCode !== ADMIN_SECRET_CODE) {
        toast.error("Code invalide", { description: "Le code d'accès administrateur est incorrect." });
        setIsLoading(false);
        return;
      }

      // Use trimmed code for role assignment
      const res = await registerUser(data.email, data.password, trimmedCode);
      if (res.success) {
        toast.success("Profil synchronisé", { description: "Connexion au Neural Core établie." });
        if (res.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/my-tickets");
        }
      } else {
        toast.error("Erreur d'inscription", { description: res.error });
        setIsLoading(false);
      }
    } catch (err: any) {
      toast.error("Anomalie système", { description: err.message || "Impossible de finaliser l'inscription." });
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen bg-background overflow-hidden text-foreground font-sans selection:bg-blue-500/30 page-wallpaper">
      <div className="mesh-bg">
        <div className="mesh-bg-gradient opacity-60 dark:opacity-100" />
        <div className="bg-grid-modern opacity-40 dark:opacity-60" />
      </div>

      <div className="flex w-full">
        {/* Left Side: Holographic Sphere (Awwwards Style) */}
        <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="relative w-full max-w-lg aspect-square"
          >
            {/* Holographic Particle Sphere */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[300px] h-[300px] rounded-full border border-border/50 bg-transparent shadow-[inset_0_0_100px_rgba(var(--foreground-rgb),0.02)] flex items-center justify-center relative overflow-hidden group animate-spin-slow">
                <div className="absolute w-[400px] h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rotate-45 group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute w-[400px] h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent -rotate-45 group-hover:scale-150 transition-transform duration-1000 delay-100" />
                <div className="w-[200px] h-[200px] rounded-full border border-border/70 flex items-center justify-center">
                  <div className="w-[100px] h-[100px] rounded-full border border-border shadow-[0_0_50px_rgba(59,130,246,0.2)] animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-10 left-10">
              <Image src="/omega-logo.png" alt="OMEGA" width={140} height={40} className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                Rejoignez le Neural Core. Une infrastructure IT prédictive conçue pour l'excellence.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Magnetic 3D Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="w-full max-w-md perspective-[2000px]"
          >
            <motion.div style={{ rotateX, rotateY }} className="w-full">
              <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="bento-card p-8 sm:p-10 rounded-[2rem] relative overflow-hidden shadow-2xl"
              >
                {/* Ripple Glow Effect */}
                <AnimatePresence>
                  {showRipple && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-0 bg-green-500/20 rounded-[2rem] pointer-events-none origin-center"
                    />
                  )}
                </AnimatePresence>

                <div className="text-center mb-8 relative z-10 flex flex-col items-center">
                  <Image 
                    src="/omega-logo.png" alt="OMEGA" width={160} height={50} 
                    className="drop-shadow-xl dark:drop-shadow-[0_0_20px_rgba(220,38,38,0.2)] object-contain mb-6" priority 
                  />
                  <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Initialisation</h2>
                  <p className="text-sm text-muted-foreground">Créez votre empreinte digitale sécurisée.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
                  <div className="space-y-1.5 group">
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground group-focus-within:text-blue-400 transition-colors">Identité Complète</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                      <Input placeholder="John Doe" {...register("fullName")} className="pl-10 h-12 bg-background/50 border-border focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] rounded-xl text-foreground transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5 group">
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground group-focus-within:text-blue-400 transition-colors">Email Professionnel</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                      <Input placeholder="nom@omega.com" {...register("email")} className="pl-10 h-12 bg-background/50 border-border focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] rounded-xl text-foreground transition-all" />
                    </div>
                  </div>

                  {/* HoloLock Section */}
                  <div className="flex gap-4 items-start pt-2">
                    <HoloLock score={passwordScore} />
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1.5">
                        <Input type="password" placeholder="Mot de passe" {...register("password")} className="h-12 bg-background/50 border-border focus:border-primary/50 rounded-xl text-foreground transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <Input type="password" placeholder="Confirmer" {...register("confirmPassword")} className={`h-12 bg-background/50 border-border rounded-xl text-foreground transition-all ${watchPassword === watchConfirm && watchConfirm.length > 0 ? 'focus:border-green-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'focus:border-primary/50'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 group pt-4 border-t border-border">
                    <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 group-focus-within:text-red-400 transition-colors">
                      <ShieldCheck className="h-3 w-3" /> Jeton Administrateur (Optionnel)
                    </Label>
                    <Input type="password" placeholder="••••••••••••" {...register("adminCode")} className="h-12 bg-background/50 border-border focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)] rounded-xl text-foreground transition-all font-mono text-xs" />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-md cursor-pointer border-none">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Valider l'empreinte <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
                    </Button>
                  </div>
                  
                  <div className="text-center mt-6">
                    <button type="button" onClick={() => router.push("/")} className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none">
                      Retour au portail
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
