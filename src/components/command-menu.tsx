"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/useAuth";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { role } = useAuth();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 sm:hidden">
        <button 
          onClick={() => setOpen(true)}
          className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Que recherchez-vous ? (Tickets, Actions...)" />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          <CommandGroup heading="Actions Rapides">
            {role === "employee" && (
              <CommandItem onSelect={() => runCommand(() => router.push("/my-tickets"))}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer un nouveau ticket
              </CommandItem>
            )}
            {role === "admin" && (
              <CommandItem onSelect={() => runCommand(() => router.push("/admin"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Accéder au Dashboard Admin
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Paramètres">
            <CommandItem onSelect={() => runCommand(async () => {
              await signOut(auth);
              router.push("/");
            })}>
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
