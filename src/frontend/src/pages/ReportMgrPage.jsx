import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import DesktopLogo from "../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../components/main/MainLayout.jsx";
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx";
import { redirect } from "../service/service.js";
import { $token, checkClearance } from "../stores/auth.js";

export default function ReportManagementPage() {
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

  function fake() {
    fetch("http://localhost:3000/fake/users");
  }

  return (
    <MainLayout>
      <header className="flex w-full flex-row items-center justify-between">
        <DesktopLogo />
        <DesktopNavigationBar />
      </header>

      <section className="flex flex-col">
        <h1 className="text-2xl font-bold">Reports Management</h1>

        <button onClick={fake}>Fake data</button>
      </section>

      <footer>
        <MobileNavigationBar />
      </footer>
    </MainLayout>
  );
}
