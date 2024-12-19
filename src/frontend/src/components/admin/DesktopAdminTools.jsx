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
import UserManagementPanel from "../UserManagementPanel";
import PublicationManagementPanel from "../PublicationManagementPanel";
import EmptyAdminPanel from "./EmptyAdminPanel.jsx";
import CategoryPanel from "../CategoryManagementPanel/Panel";

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
          <label className="flex w-full cursor-pointer flex-row items-center gap-2 px-6 py-2 font-semibold opacity-50 duration-200 hover:opacity-100 has-[:checked]:opacity-100">
            <MdOutlineManageAccounts color="white" className="size-6" />
            <input
              type="radio"
              name="admin"
              className="m-0 size-0 appearance-none p-0"
              checked={selection == 0}
              onChange={() => {
                setSelection(0);
                $adminPanel.set(<UserManagementPanel />);
              }}
            />
            Manage Users
          </label>

          {/* React-icons doesn't have folder_managed symbol from Material Design */}
          <label className="flex w-full cursor-pointer flex-row items-center gap-2 px-6 py-2 font-semibold opacity-50 duration-200 hover:opacity-100 has-[:checked]:opacity-100">
            <LuFolderCog color="white" className="size-6" />
            <input
              type="radio"
              name="admin"
              className="m-0 size-0 appearance-none p-0"
              checked={selection == 1}
              onChange={() => {
                setSelection(1);
                $adminPanel.set(<PublicationManagementPanel />);
              }}
            />
            Manage Publications
          </label>

          <label className="flex w-full cursor-pointer flex-row items-center gap-2 px-6 py-2 font-semibold opacity-50 duration-200 hover:opacity-100 has-[:checked]:opacity-100">
            <MdOutlineFlag color="white" className="size-6" />
            <input
              type="radio"
              name="admin"
              className="m-0 size-0 appearance-none p-0"
              checked={selection == 2}
              onChange={() => {
                setSelection(2);
                $adminPanel.set(<ReportsPanel />);
              }}
            />
            Manage Reports
          </label>

          <label className="flex w-full cursor-pointer flex-row items-center gap-2 px-6 py-2 font-semibold opacity-50 duration-200 hover:opacity-100 has-[:checked]:opacity-100">
            <MdOutlineCategory color="white" className="size-6" />
            <input
              type="radio"
              name="admin"
              className="m-0 size-0 appearance-none p-0"
              checked={selection == 3}
              onChange={() => {
                setSelection(3);
                $adminPanel.set(<CategoryPanel />);
              }}
            />
            Manage Categories
          </label>

          <label className="flex w-full cursor-pointer flex-row items-center gap-2 px-6 py-2 font-semibold opacity-50 duration-200 hover:opacity-100 has-[:checked]:opacity-100">
            <MdOutlineFace color="white" className="size-6" />
            <input
              type="radio"
              name="admin"
              className="m-0 size-0 appearance-none p-0"
              checked={selection == 4}
              onChange={() => {
                setSelection(4);
                $adminPanel.set(null);
              }}
            />
            Manage Authors
          </label>
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
