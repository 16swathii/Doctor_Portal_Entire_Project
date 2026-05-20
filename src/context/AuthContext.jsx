import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force stop loading after 3 seconds no matter what
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      if (session?.user) {
        setDoctor(session.user);
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    return () => clearTimeout(timeout);
  }, []);

  const signup = async (form) => {
    const { email, password, name, specialisation, licenseNo, hospital } = form;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('doctors').insert({
        id: data.user.id,
        name, specialisation,
        license_no: licenseNo,
        hospital, email
      });
      setDoctor({ ...data.user, name, email });
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const { data: docData } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', data.user.id)
        .single();
      setDoctor({ ...data.user, ...docData });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setDoctor(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#737373'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ doctor, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);