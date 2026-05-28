import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGuard({ children }) {
  const { doctor, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", fontFamily: "Inter, sans-serif", color: "#737373", fontSize: 14,
    }}>
      Loading...
    </div>
  );

  if (!doctor) return <Navigate to="/login" replace />;

  return children;
}