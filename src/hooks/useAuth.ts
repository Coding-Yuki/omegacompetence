"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/app/actions";

export type UserRole = "admin" | "employee" | null;
export interface User {
  email: string;
}

export function useAuth(): { user: User | null; role: UserRole; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSession().then((session) => {
      if (cancelled) return;
      if (session.authenticated && session.email && session.role) {
        setUser({ email: session.email });
        setRole(session.role as UserRole);
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { user, role, loading };
}
