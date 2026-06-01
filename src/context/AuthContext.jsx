import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [doctor, setDoctor]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDoctor(userId) {
      try {
        // ── your doctors table uses "id" = auth user id ──
        const { data, error } = await supabase
          .from("doctors")
          .select("*")
          .eq("id", userId)   // ← FIXED: was "user_id", should be "id"
          .single();

        console.log("loadDoctor →", data, error);
        if (mounted) setDoctor(data ?? { id: userId });
      } catch (err) {
        console.error("loadDoctor error:", err);
        if (mounted) setDoctor({ id: userId });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("getSession →", session?.user?.id, error);
      if (!mounted) return;
      if (session?.user) {
        loadDoctor(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error("getSession error:", err);
      if (mounted) setLoading(false);
    });

    // Auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("authStateChange →", event, session?.user?.id);
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        loadDoctor(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setDoctor(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signup = async (form) => {
    const { email, password, name, specialisation, licenseNo, hospital } = form;

    // Step 1 — Create auth user with name in metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name } // trigger uses this to set name
      }
    });
    if (error) throw error;

    // Step 2 — Try to upsert doctor profile
    // This may fail if email confirmation is ON (user not confirmed yet)
    // That's OK — trigger already inserted basic row
    // Full profile will be saved on first login
    if (data.user) {
      try {
        await supabase.from('doctors').upsert({
          id:            data.user.id,
          name,
          email,
          specialisation,
          license_no:    licenseNo,
          hospital,
        }, { onConflict: 'id' });
      } catch (dbErr) {
        // Silently ignore — trigger already saved basic profile
        // Full details will be updated on first login
        console.log('Profile will be completed on first login:', dbErr.message);
      }
    }
    // Always show success — auth user was created
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setDoctor(null);
  };

  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", fontFamily: "Inter, sans-serif", color: "#737373", fontSize: 14,
    }}>
      Loading...
    </div>
  );

  return (
    <AuthContext.Provider value={{ doctor, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);