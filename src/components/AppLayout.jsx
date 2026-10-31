import { Outlet } from "react-router-dom";
import TopBar from "./TopBar.jsx";
import BottomNav from "./BottomNav.jsx";
import "./AppLayout.css";

// Giriş yapılmış sayfaların düzeni: TopBar + içerik + BottomNav (Bölüm 4.3)
export default function AppLayout() {
  return (
    <div className="ui-app-layout">
      <TopBar />
      <main className="ui-app-layout__content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
