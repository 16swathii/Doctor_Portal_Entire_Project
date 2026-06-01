import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Portal from "./pages/Portal";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup"  element={<Signup />} />
          <Route path="/login"   element={<Login />} />

          {/* Handles email confirmation redirect */}
          <Route path="/auth/callback" element={<Navigate to="/portal" replace />} />

          <Route path="/portal" element={
            <AuthGuard><Portal /></AuthGuard>
          } />

          {/* Default → go to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}