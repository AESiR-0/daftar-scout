import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_DB_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_DB_SUPABASE_ANON_KEY!
);

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: "founder" | "investor" | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    role: null,
  });

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setAuthState({
        user,
        isAuthenticated: !!user,
        role: user?.user_metadata?.role ?? null, // Adjust based on where role is stored
      });
    });

    // Listen for auth state changes (e.g., login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        let role: "founder" | "investor" | null = user?.user_metadata?.role ?? null;

        // If role isn't in user_metadata, fetch from profiles table
        if (user && !role) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (!error && data) {
            role = data.role;
          }
        }

        setAuthState({
          user,
          isAuthenticated: !!user,
          role,
        });
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return authState;
}