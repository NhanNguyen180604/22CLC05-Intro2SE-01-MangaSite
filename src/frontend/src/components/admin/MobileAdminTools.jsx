import { LuFolderCog } from "react-icons/lu";
import {
  MdOutlineCategory,
  MdOutlineFace,
  MdOutlineFlag,
  MdOutlineManageAccounts,
} from "react-icons/md";
import { $adminPanel } from "../../stores/admin-tools.js";
import ReportsPanel from "../reports/ReportsPanel.jsx";
import MobileAdminPanel from "./MobileAdminPanel.jsx";
import MobileAdminTab from "./MobileAdminTab.jsx";

export default function MobileAdminTools() {
  return (
    <section className="flex w-full flex-col lg:hidden">
      <MobileAdminPanel />

      <div className="-mx-6 -mt-10 bg-red py-4 text-center font-semibold text-black lg:m-0 lg:mt-8">
        Administrative Tools
      </div>

      <fieldset className="-mx-6 my-12 flex flex-col divide-y-2 divide-blue font-semibold">
        <MobileAdminTab
          icon={<MdOutlineManageAccounts color="white" className="size-6" />}
          label={"Manage Users"}
          onClick={() => {}}
        />
        {/* React-icons doesn't have folder_managed symbol from Material Design */}
        <MobileAdminTab
          icon={<LuFolderCog color="white" className="size-6" />}
          label={"Manage Publications"}
          onClick={() => {}}
        />
        <MobileAdminTab
          icon={<MdOutlineFlag color="white" className="size-6" />}
          label={"Manage Reports"}
          onClick={() => $adminPanel.set(<ReportsPanel />)}
        />
        <MobileAdminTab
          icon={<MdOutlineCategory color="white" className="size-6" />}
          label={"Manage Categories"}
          onClick={() => {}}
        />
        <MobileAdminTab
          icon={<MdOutlineFace color="white" className="size-6" />}
          label={"Manage Authors"}
          onClick={() => {}}
        />
      </fieldset>
    </section>
  );
}
