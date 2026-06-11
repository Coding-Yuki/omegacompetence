"use client";

import { useAuth } from "@/hooks/useAuth";
// Firebase imports removed – auth will be handled via JWT.
import { logoutUser } from "@/app/actions";
import { LogOut, Shield, User2, Zap } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { user, role } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between max-w-[1400px]">
        
        <div className="flex items-center gap-6">
            <div className="flex items-center">
              <Image 
                src="/omega-logo.png" 
                alt="OMEGA" 
                width={110} 
                height={32} 
                className="drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] object-contain"
              />
            </div>
          </div>
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full border border-border/50 bg-background/50">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted">
              {role === 'admin' ? (
                <Shield className="h-3.5 w-3.5 text-foreground" />
              ) : (
                <User2 className="h-3.5 w-3.5 text-foreground" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground/90 leading-none">
                {user?.email?.split('@')[0] ?? ''}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                {role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </span>
            </div>
          </div>

          <div className="w-[1px] h-6 bg-border/50 hidden sm:block" />

          <ThemeToggle />
          
          <button 
            onClick={handleLogout}
            className="neo-button inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full bg-muted text-foreground hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm font-semibold text-xs border border-border/50 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
