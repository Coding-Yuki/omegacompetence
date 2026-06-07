"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/app/actions";

export type UserRole = "admin" | "employee" | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  
  // Track if we've already fetched the role for the current user to prevent redundant calls
  const fetchedRoleForUid = useRef<string | null>(null);
  // Track if we're currently fetching to prevent concurrent requests
  const isFetchingRef = useRef(false);

  const fetchUserRole = useCallback(async (currentUser: User) => {
    // Skip server call if we've already fetched for this user, but don't skip loading state update
    if (fetchedRoleForUid.current === currentUser.uid) {
      setLoading(false);
      return;
    }
    
    if (isFetchingRef.current) {
      return; // Already fetching, don't start another request
    }
    
    isFetchingRef.current = true;
    try {
      // Only refresh token if it's expired or about to expire (within 5 minutes)
      // This prevents unnecessary token refresh loops
      const tokenResult = await currentUser.getIdTokenResult();
      const tokenExpirationTime = new Date(tokenResult.expirationTime).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (tokenExpirationTime - now > fiveMinutes) {
        // Token is still valid, use existing token
        console.log('[useAuth] Token still valid, skipping refresh');
      } else {
        // Token is expiring soon, refresh it
        console.log('[useAuth] Token expiring, refreshing...');
        await currentUser.getIdToken(true);
      }
      
      const res = await getUserRole(currentUser.uid, currentUser.email || "");
      if (res.success) {
        setRole(res.role as UserRole);
        fetchedRoleForUid.current = currentUser.uid;
      } else {
        setRole("employee");
        fetchedRoleForUid.current = currentUser.uid;
      }
    } catch (error) {
      console.error("Erreur de synchronisation du rôle", error);
      setRole("employee");
      fetchedRoleForUid.current = currentUser.uid;
    } finally {
      isFetchingRef.current = false;
      // Only set loading to false after role is fully determined
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Guard: si l'objet auth n'est pas dispo (ex: SSR), on ignore l'abonnement
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        fetchUserRole(currentUser);
        // Keep loading true while fetchUserRole runs; it will set loading to false when done
      } else {
        setRole(null);
        fetchedRoleForUid.current = null; // Reset when user logs out
        setLoading(false); // User logged out, we're done loading
      }
    });

    return () => unsubscribe();
  }, [fetchUserRole]);

  return { user, role, loading };
}
