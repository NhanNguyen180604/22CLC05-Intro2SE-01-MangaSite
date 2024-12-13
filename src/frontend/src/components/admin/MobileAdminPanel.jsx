import { useStore } from "@nanostores/react";
import { $adminPanel } from "../../stores/admin-tools.js";

/*
This panel is only available on mobile.
It is supposed to do a slide-in animation when an admin option is selected.
The desktop version is a lot different.
*/
export default function MobileAdminPanel() {
  const adminPanel = useStore($adminPanel);

  return (
    <div
      className={`fixed inset-0 z-40 size-full bg-black/50 duration-200 lg:hidden ${adminPanel ? "translate-x-0" : "invisible translate-x-full"}`}
    >
      <div className="absolute inset-0 size-full bg-dark-navy shadow-lg">
        {adminPanel}
      </div>
    </div>
  );
}
