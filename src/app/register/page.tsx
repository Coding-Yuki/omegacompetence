"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerUser, loginUser } from "@/app/actions";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { UserPlus, ArrowRight, Loader2, ShieldCheck, Mail, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoloLock } from "@/components/HoloLock";
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
      if (!res.success) {
        toast.error("Erreur d'inscription", { description: res.error });
        setIsLoading(false);
        return;
      }

      // Auto login after successful registration
      const loginResult = await loginUser(data.email, data.password);
      if (!loginResult.success) {
        toast.error("Inscription réussie mais connexion échouée", { description: "Veuillez vous connecter manuellement." });
        setIsLoading(false);
        router.push("/");
        return;
      }

      toast.success("Profil créé", { description: "Connexion établie." });

      // Hard redirect based on role
      if (loginResult.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/my-tickets";
      }
    } catch (err: any) {
      toast.error("Anomalie système", { description: err.message || "Impossible de finaliser l'inscription." });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, type: "spring", stiffness: 90 }}
          className="w-full"
        >
          <div className="border border-gray-200 bg-white shadow-xl shadow-slate-200/60 rounded-[2rem] p-8 sm:p-10">
            <div className="flex flex-col items-center gap-4 text-center mb-8">
              <Image src="/omega-logo.png" alt="Omega logo" width={90} height={90} className="mx-auto" />
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Créez votre compte</h1>
              <p className="text-sm text-slate-600 max-w-md">Complétez les informations pour rejoindre le portail de gestion des incidents.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Identité complète</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    {...register("fullName")}
                    className="h-12 w-full rounded-2xl bg-white text-gray-900 border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 placeholder:text-gray-400 px-4 pl-11"
                  />
                </div>
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Email professionnel</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    {...register("email")}
                    className="h-12 w-full rounded-2xl bg-white text-gray-900 border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 placeholder:text-gray-400 px-4 pl-11"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-900">Mot de passe</Label>
                  <Input
                    type="password"
                    {...register("password")}
                    className="h-12 w-full rounded-2xl bg-white text-gray-900 border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 placeholder:text-gray-400 px-4"
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-900">Confirmer le mot de passe</Label>
                  <Input
                    type="password"
                    {...register("confirmPassword")}
                    className="h-12 w-full rounded-2xl bg-white text-gray-900 border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 placeholder:text-gray-400 px-4"
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <Label className="text-sm font-semibold text-slate-900">Code administrateur</Label>
                  <span className="text-sm text-slate-500">Optionnel</span>
                </div>
                <Input
                  type="password"
                  {...register("adminCode")}
                  className="h-12 w-full rounded-2xl bg-white text-gray-900 border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 placeholder:text-gray-400 px-4 font-mono text-sm"
                />
                {errors.adminCode && <p className="text-sm text-red-600">{errors.adminCode.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-red-600 text-white hover:bg-red-700 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 shadow-lg shadow-red-600/10"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer un compte"}
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
