"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutUser } from "@/app/actions";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: any;
}

export function AdminSidebar({
  navItems,
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapsed,
}: {
  navItems: readonly SidebarNavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col border-r border-border/40 bg-background/80 backdrop-blur-2xl transition-[width] duration-300 ease-out"
      style={{ width: collapsed ? 64 : 240 }}
    >
      <div className="flex items-center h-16 shrink-0 border-b border-border/40 px-4">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center w-full"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20">
                Ω
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Image
                src="/omega-logo.png"
                alt="OMEGA"
                width={110}
                height={32}
                className="drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
                isActive
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
              } ${collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5"}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border/40 py-3 px-2 space-y-1 shrink-0">
        <div className={`flex items-center ${collapsed ? "justify-center" : "px-1 py-1"}`}>
          <ThemeToggle />
          {!collapsed && <span className="ml-3 text-xs text-muted-foreground">Thème</span>}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer ${
            collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5"
          }`}
          title="Déconnexion"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>

        <button
          onClick={onToggleCollapsed}
          className={`w-full flex items-center gap-3 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted border border-transparent transition-all duration-200 cursor-pointer ${
            collapsed ? "justify-center h-8 w-8 mx-auto" : "px-3 py-2"
          }`}
          title={collapsed ? "Développer" : "Réduire"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
