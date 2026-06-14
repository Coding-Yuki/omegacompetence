"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser } from "@/app/actions";
import { authSchema, AuthInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";


export default function AuthPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [authEnabled, setAuthEnabled] = useState(false);
  const { user, role, loading } = useAuth(authEnabled);
  const [mounted, setMounted] = useState(false);
  const hasRedirectedRef = useRef(false);


  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const rotateX = useTransform(springY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-7deg", "7deg"]);

  useEffect(() => {
    async function clearSession() {
      await logoutUser();
      setAuthEnabled(true);
      setMounted(true);
    }
    clearSession();
  }, []);


  useEffect(() => {
    if (!user) {
      hasRedirectedRef.current = false;
      setError("");
    }
  }, [user]);

  useEffect(() => {

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


  useEffect(() => {
    if (!user || role) return; // Skip if no user or role is already set
    
    const timeoutId = setTimeout(() => {
      if (!hasRedirectedRef.current) {
        setError("Impossible de charger votre profil. Veuillez réessayer.");
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [user, role]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthInput>({
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
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await loginUser(data.email, data.password);
        if (res.success) {
        if (res.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/my-tickets";
        }
        return;
      } else {
        toast.error("Erreur système", { description: res.error });
      }
      setIsLoading(false);
      reset({ email: data.email, password: "" });
      return;
    } catch (err: any) {
      setError("Anomalie système détectée.");
      setIsLoading(false);
      reset({ email: data.email, password: "" });
    }
  }



  if (!mounted || loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50" suppressHydrationWarning>
        <Loader2 className="h-8 w-8 animate-spin text-red-600 opacity-75" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 text-slate-900" suppressHydrationWarning>
      <div className="w-full max-w-md mx-auto">
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, scale: 0.97, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, type: "spring", stiffness: 90 }}
        >
          <div className="border border-gray-200 bg-white shadow-xl shadow-slate-200/60 rounded-[2rem] p-8 sm:p-10">
            <div className="flex flex-col items-center gap-4 text-center mb-8">
              <Image src="/omega-logo.png" alt="Omega logo" width={90} height={90} className="mx-auto" />
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Accès sécurisé</h1>
              <p className="text-sm text-slate-600 max-w-sm">Connectez-vous pour piloter les incidents et suivre votre tableau de bord professionnel.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  >
                    <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 text-red-700 rounded-xl">
                      <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-900">Email professionnel</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="h-12 w-full rounded-2xl bg-white text-gray-900 border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 placeholder:text-gray-400 px-4"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-900">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="h-12 w-full rounded-2xl bg-white text-gray-900 border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 placeholder:text-gray-400 px-4 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-red-600 text-white hover:bg-red-700 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 shadow-lg shadow-red-600/10"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Créer un compte
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
