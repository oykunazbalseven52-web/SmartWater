import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TopBar from "./components/TopBar.jsx";
import { isLoggedIn } from "./services/smartWaterService.js";
import LoginPage from "./pages/Login/LoginPage.jsx";
import HomePage from "./pages/Home/HomePage.jsx";
import PurchasePage from "./pages/Purchase/PurchasePage.jsx";
import NfcLoadPage from "./pages/NfcLoad/NfcLoadPage.jsx";
import HistoryPage from "./pages/History/HistoryPage.jsx";
import AboutPage from "./pages/About/AboutPage.jsx";
import UsagePage from "./pages/Postpaid/UsagePage.jsx";

// "/" → giriş yapılmışsa /home, değilse /login
function RootRedirect() {
  return <Navigate to={isLoggedIn() ? "/home" : "/login"} replace />;
}

// /login → giriş yapılmışsa /home'a yönlendir
function GuestOnly({ children }) {
  if (isLoggedIn()) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* TopBar/BottomNav yok */}
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />

        {/* Herkes erişir; geri butonlu TopBar, BottomNav yok */}
        <Route
          path="/about"
          element={
            <>
              <TopBar title="Hakkında" showBack />
              <AboutPage />
            </>
          }
        />

        {/* Giriş gerekli + AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/load" element={<NfcLoadPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
