"use client";

import { useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, providers, configureAuthPersistence } from "@/lib/firebase/client";
import { useAuthStore } from "@/lib/state/auth-store";

export function FirebaseAuthProvider({ children }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    let unsubscribe = () => {};
    async function bootstrap() {
      try {
        await configureAuthPersistence();
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser);
        });
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
    return () => unsubscribe();
  }, [setError, setLoading, setUser]);

  return children;
}

export async function signInWithProvider(provider) {
  const authProvider = providers[provider];
  if (!authProvider) {
    throw new Error(`Unsupported auth provider: ${provider}`);
  }
  return signInWithPopup(auth, authProvider);
}

export async function signOutUser() {
  await signOut(auth);
}
