import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }) {
  const { doctor, loading } = useAuth();

  if (loading) return <div style={{padding: 40}}>Loading...</div>;
  
  return doctor ? children : <Navigate to="/login" replace />;
}