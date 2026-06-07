"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught by Next.js Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="bg-grid-pattern absolute inset-0 opacity-[0.15] pointer-events-none" />
      <div className="aurora-orb-red absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[150px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <Alert variant="destructive" className="glass-deep border-red-500/30 bg-card/90 text-foreground p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <AlertTriangle className="h-8 w-8 text-red-500 mb-4" strokeWidth={1.5} />
          <AlertTitle className="text-xl font-bold tracking-tight mb-2 text-foreground">Anomalie Critique</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed text-muted-foreground">
            Une erreur système inattendue s'est produite. Le flux de données a été interrompu. 
            Veuillez relancer la séquence ou contacter l'ingénieur système.
            
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={() => reset()} 
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl transition-all"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Relancer le module
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
