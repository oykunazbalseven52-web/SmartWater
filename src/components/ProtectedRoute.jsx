import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../services/smartWaterService.js";

// "Giriş gerekli" rotaları sarar: oturum yoksa /login'e yönlendirir (Bölüm 6)
export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children ?? <Outlet />;
}
