import { LuFolderCog } from "react-icons/lu";
import {
  MdOutlineCategory,
  MdOutlineFace,
  MdOutlineFlag,
  MdOutlineManageAccounts,
} from "react-icons/md";
import { $adminPanel } from "../../stores/admin-tools.js";
import UserManagementPanel from "../UserManagementPanel";
import ReportsPanel from "../reports/ReportsPanel.jsx";
import AdminTab from "./AdminTab.jsx";
import MobileAdminPanel from "./MobileAdminPanel.jsx";

export default function MobileAdminTools() {
  return (
    <section className="flex w-full flex-col lg:hidden">
      <MobileAdminPanel />

      <div className="-mx-6 -mt-10 bg-light-red py-4 text-center font-semibold text-black lg:m-0 lg:mt-8">
        Administrative Tools
      </div>

      <fieldset className="-mx-6 my-12 flex flex-col divide-y-2 divide-blue font-semibold">
        <AdminTab
          icon={<MdOutlineManageAccounts color="white" className="size-6" />}
          label={"Manage Users"}
          checked={true}
          onClick={() => $adminPanel.set(<UserManagementPanel />)}
        />
        {/* React-icons doesn't have folder_managed symbol from Material Design */}
        <AdminTab
          icon={<LuFolderCog color="white" className="size-6" />}
          label={"Manage Publications"}
          checked={true}
          onClick={() => { }}
        />
        <AdminTab
          icon={<MdOutlineFlag color="white" className="size-6" />}
          label={"Manage Reports"}
          checked={true}
          onClick={() => $adminPanel.set(<ReportsPanel />)}
        />
        <AdminTab
          icon={<MdOutlineCategory color="white" className="size-6" />}
          label={"Manage Categories"}
          checked={true}
          onClick={() => { }}
        />
        <AdminTab
          icon={<MdOutlineFace color="white" className="size-6" />}
          label={"Manage Authors"}
          checked={true}
          onClick={() => { }}
        />
      </fieldset>
    </section>
  );
}
