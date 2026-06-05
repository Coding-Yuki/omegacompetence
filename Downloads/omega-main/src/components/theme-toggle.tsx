"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-transparent border border-border opacity-50" />;
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-full border border-border bg-background hover:bg-muted text-foreground transition-all duration-300 relative overflow-hidden group"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun className="h-[1.1rem] w-[1.1rem] absolute transition-all duration-500 rotate-0 scale-100 opacity-100 dark:-rotate-90 dark:scale-0 dark:opacity-0 text-amber-500" />
        <Moon className="h-[1.1rem] w-[1.1rem] absolute transition-all duration-500 rotate-90 scale-0 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100 text-blue-400" />
      </div>
      <span className="sr-only">Changer le thème</span>
    </Button>
  );
}
