import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { redirect } from "react-router-dom";
import MobileAdminTools from "../components/admin/MobileAdminTools.jsx";
import DesktopLogo from "../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../components/main/MainLayout.jsx";
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx";
import { $token, checkClearance } from "../stores/auth.js";

export default function AdminPage() {
  const token = useStore($token);
  const [clearance, setClearance] = useState(-1);

  // The token
  useEffect(() => {
    checkClearance().then(setClearance);
  }, [token]);

  if (clearance < 0) {
    return (
      <MainLayout>
        <h1 className="animate-pulse text-xl font-semibold">Loading...</h1>
      </MainLayout>
    );
  }

  if (clearance < 3) {
    redirect("/401");
    return;
  }

  return (
    <MainLayout>
      <header className="flex w-full flex-row items-center justify-between">
        <DesktopLogo />
        <DesktopNavigationBar />
      </header>

      <MobileAdminTools />

      <footer>
        <MobileNavigationBar />
      </footer>
    </MainLayout>
  );
}
