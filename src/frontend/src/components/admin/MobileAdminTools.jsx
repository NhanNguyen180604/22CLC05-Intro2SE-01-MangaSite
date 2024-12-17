import { LuFolderCog } from "react-icons/lu";
import {
  MdChevronRight,
  MdOutlineCategory,
  MdOutlineFace,
  MdOutlineFlag,
  MdOutlineManageAccounts,
} from "react-icons/md";
import { $adminPanel } from "../../stores/admin-tools.js";
import UserManagementPanel from "../UserManagementPanel";
import PublicationManagementPanel from "../PublicationManagementPanel";
import ReportsPanel from "../reports/ReportsPanel.jsx";
import MobileAdminPanel from "./MobileAdminPanel.jsx";

export default function MobileAdminTools() {
  return (
    <section className="flex w-full flex-col lg:hidden">
      <MobileAdminPanel />

      <div className="-mx-6 -mt-10 bg-light-red py-4 text-center font-semibold text-black">
        Administrative Tools
      </div>

      <div className="-mx-6 my-12 flex flex-col divide-y-2 divide-blue font-semibold">
        <button
          className="flex w-full cursor-pointer flex-row items-center justify-between px-6 py-5 duration-200 hover:bg-medium-navy"
          onClick={() => {
            $adminPanel.set(<UserManagementPanel />);
          }}
        >
          <div className="flex flex-row items-center gap-2 font-semibold duration-200">
            <MdOutlineManageAccounts color="white" className="size-6" />
            Manage Users
          </div>

          <MdChevronRight color="white" className="size-6" />
        </button>

        {/* React-icons doesn't have folder_managed symbol from Material Design */}
        <button
          className="flex w-full cursor-pointer flex-row items-center justify-between px-6 py-5 duration-200 hover:bg-medium-navy"
          onClick={() => {
            $adminPanel.set(<PublicationManagementPanel />);
          }}
        >
          <div className="flex flex-row items-center gap-2 font-semibold duration-200">
            <LuFolderCog color="white" className="size-6" />
            Manage Publications
          </div>

          <MdChevronRight color="white" className="size-6" />
        </button>

        <button
          className="flex w-full cursor-pointer flex-row items-center justify-between px-6 py-5 duration-200 hover:bg-medium-navy"
          onClick={() => {
            $adminPanel.set(<ReportsPanel />);
          }}
        >
          <div className="flex flex-row items-center gap-2 font-semibold duration-200">
            <MdOutlineFlag color="white" className="size-6" />
            Manage Reports
          </div>

          <MdChevronRight color="white" className="size-6" />
        </button>

        <button
          className="flex w-full cursor-pointer flex-row items-center justify-between px-6 py-5 duration-200 hover:bg-medium-navy"
          onClick={() => {
            $adminPanel.set(null);
          }}
        >
          <div className="flex flex-row items-center gap-2 font-semibold duration-200">
            <MdOutlineCategory color="white" className="size-6" />
            Manage Categories
          </div>

          <MdChevronRight color="white" className="size-6" />
        </button>

        <button
          className="flex w-full cursor-pointer flex-row items-center justify-between px-6 py-5 duration-200 hover:bg-medium-navy"
          onClick={() => {
            $adminPanel.set(null);
          }}
        >
          <div className="flex flex-row items-center gap-2 font-semibold duration-200">
            <MdOutlineFace color="white" className="size-6" />
            Manage Authors
          </div>

          <MdChevronRight color="white" className="size-6" />
        </button>
      </div>
    </section>
  );
}
