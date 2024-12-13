import { useStore } from "@nanostores/react";
import { useState } from "react";
import { LuFolderCog } from "react-icons/lu";
import {
  MdOutlineCategory,
  MdOutlineFace,
  MdOutlineFlag,
  MdOutlineManageAccounts,
} from "react-icons/md";
import { $adminPanel } from "../../stores/admin-tools.js";
import ReportsPanel from "../reports/ReportsPanel.jsx";
import AdminTab from "./AdminTab.jsx";
import EmptyAdminPanel from "./EmptyAdminPanel.jsx";

export default function DesktopAdminTools() {
  const [selection, setSelection] = useState(-1);
  const adminPanel = useStore($adminPanel);

  return (
    <section className="hidden w-full flex-col gap-16 lg:flex">
      <div className="bg-light-red py-4 text-center font-semibold text-black lg:m-0 lg:mt-8">
        Administrative Tools
      </div>

      <div className="flex w-full flex-row items-start justify-center">
        <fieldset className="flex min-w-[13.5rem] shrink-0 flex-col gap-2">
          <AdminTab
            icon={<MdOutlineManageAccounts color="white" className="size-6" />}
            label={"Manage Users"}
            checked={selection == 0}
            onClick={() => {
              setSelection(0);
              // Set $adminPanel to manage users panel.
              $adminPanel.set(null);
            }}
          />
          {/* React-icons doesn't have folder_managed symbol from Material Design */}
          <AdminTab
            icon={<LuFolderCog color="white" className="size-6" />}
            label={"Manage Publications"}
            checked={selection == 1}
            onClick={() => {
              setSelection(1);
              // Set $adminPanel to manage publications panel.
              $adminPanel.set(null);
            }}
          />
          <AdminTab
            icon={<MdOutlineFlag color="white" className="size-6" />}
            label={"Manage Reports"}
            checked={selection == 2}
            onClick={() => {
              setSelection(2);
              $adminPanel.set(<ReportsPanel />);
            }}
          />
          <AdminTab
            icon={<MdOutlineCategory color="white" className="size-6" />}
            label={"Manage Categories"}
            checked={selection == 3}
            onClick={() => {
              setSelection(3);
              // Set $adminPanel to manage categories panel.
              $adminPanel.set(null);
            }}
          />
          <AdminTab
            icon={<MdOutlineFace color="white" className="size-6" />}
            label={"Manage Authors"}
            checked={selection == 4}
            onClick={() => {
              setSelection(4);
              $adminPanel.set(null);
            }}
          />
        </fieldset>

        {adminPanel ? (
          <div className="flex size-full h-fit min-h-[33.5rem] flex-col rounded-xl bg-darker-navy">
            {adminPanel}
          </div>
        ) : (
          <EmptyAdminPanel />
        )}
      </div>
    </section>
  );
}
