"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authSchema, AuthInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { getUserRole } from "@/app/actions";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const springItem = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 80, damping: 20 } }
};

export default function AuthPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const hasRedirectedRef = useRef(false);

  // Parallax / 3D Card Effect
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const rotateX = useTransform(springY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-7deg", "7deg"]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    // Guard: prevent multiple redirects
    if (hasRedirectedRef.current) return;
    
    if (!loading && user) {
      hasRedirectedRef.current = true;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "employee") {
        router.push("/my-tickets");
      }
    }
  }, [user, role, loading, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${(mouseX / rect.width) * 100}%`);
    cardRef.current.style.setProperty("--mouse-y", `${(mouseY / rect.height) * 100}%`);
    const normalizedX = mouseX / rect.width - 0.5;
    const normalizedY = mouseY / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  async function onSubmit(data: AuthInput) {
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") setError("Identifiants non reconnus.");
      else setError("Anomalie système détectée.");
      setIsLoading(false);
    }
  }

  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Once Firebase confirms a user, call the action ourselves so we can show any error string
    if (!loading && user && !authError) {
      (async () => {
        const res = await getUserRole(user.uid, user.email || "");
        console.log("AUTH_ACTION_ERROR:", res);
        if (res && (res as any).error) {
          setAuthError((res as any).error as string);
        }
      })();
    }
  }, [loading, user, authError]);

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6" suppressHydrationWarning>
        <div className="max-w-3xl w-full p-8 rounded-2xl border-4 border-red-600 bg-red-50 text-red-700 font-extrabold text-2xl md:text-3xl break-words shadow-2xl">
          ⚠️ {authError}
        </div>
      </div>
    );
  }

  if (!mounted || loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" suppressHydrationWarning>
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12" suppressHydrationWarning>
      {/* ━━━━━━━━━━ BACKGROUND VIVANT ━━━━━━━━━━ */}
      <div className="mesh-bg">
        <div className="mesh-bg-gradient opacity-60 dark:opacity-100" />
        <div className="bg-grid-modern" />
        <div className="absolute top-[20%] left-[20%] w-3 h-3 rounded-full bg-primary/40 blur-[2px] animate-blob-float" />
        <div className="absolute top-[60%] right-[20%] w-4 h-4 rounded-full bg-blue-500/40 blur-[3px] animate-blob-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] left-[40%] w-2 h-2 rounded-full bg-purple-500/40 blur-[1px] animate-blob-float" style={{ animationDelay: '4s' }} />
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm z-[5] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* ━━━━━━━━━━ HERO SECTION IMMERSIVE ━━━━━━━━━━ */}
        <motion.div 
          className="hidden lg:flex flex-col justify-center"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={springItem} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/30 backdrop-blur-xl w-max mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-foreground/80">Neo Glass Intelligence</span>
          </motion.div>
          
          <motion.h1 variants={springItem} className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-gradient-hero">
            Le futur du <br/>
            <span className="text-gradient-primary">support IT intelligent.</span>
          </motion.h1>
          
          <motion.p variants={springItem} className="text-lg text-muted-foreground leading-relaxed max-w-md mb-12">
            Une plateforme IA premium conçue pour les entreprises modernes. Fluidité absolue, sécurité maximale, design world-class.
          </motion.p>

          <motion.div variants={springItem}>
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-foreground mb-2">Nouveau membre de l'organisation ?</h3>
                <p className="text-xs text-muted-foreground mb-4">Initialisez votre profil sécurisé pour accéder au portail.</p>
                <Button 
                  onClick={() => router.push("/register")}
                  variant="outline"
                  className="rounded-xl border-primary/20 text-primary hover:bg-primary/10 group-hover:border-primary/50 transition-all font-semibold"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Démarrer l'intégration
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ━━━━━━━━━━ LOGIN CARD 3D ━━━━━━━━━━ */}
        <motion.div 
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          style={{ perspective: 2000 }}
        >
          <motion.div style={{ rotateX, rotateY }} className="relative">
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="bento-card glass-panel p-8 sm:p-10 relative overflow-hidden"
            >
              <div className="flex justify-center mb-8">
                <Image 
                  src="/omega-logo.png" alt="OMEGA" width={180} height={55} 
                  className="drop-shadow-xl dark:drop-shadow-[0_0_20px_rgba(220,38,38,0.2)] object-contain" priority 
                />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Session requise</h2>
                <p className="text-sm text-muted-foreground mt-2">Accédez à votre centre de contrôle.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    >
                      <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 rounded-xl">
                        <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Email pro</Label>
                  <div onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
                    <Input id="email" type="email" placeholder="nom@entreprise.com" {...register("email")} className="h-12 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 text-foreground transition-all duration-300" />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Clé de sécurité</Label>
                  <div className="relative" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} className="h-12 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 text-foreground pr-11 transition-all duration-300" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" disabled={isLoading}
                  className="neo-button w-full h-12 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Ouvrir la session <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
                </Button>

                <Button 
                  type="button"
                  className="w-full h-12 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 mt-3 transition-all duration-300"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Se connecter avec Google
                </Button>
              </form>
              
              {/* Mobile Only Register Link */}
              <div className="mt-8 pt-6 border-t border-border/50 text-center lg:hidden">
                <button onClick={() => router.push("/register")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Démarrer l'intégration
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
