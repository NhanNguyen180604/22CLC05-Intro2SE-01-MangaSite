import { useState } from "react";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdChevronLeft,
  MdOutlineSearch,
} from "react-icons/md";
import { $adminPanel } from "../../stores/admin-tools.js";
import ReportsList from "./ReportsList.jsx";

export default function ReportsPanel() {
  const [search, setSearch] = useState("");
  const [showProcessed, setShowProcessed] = useState(false);

  return (
    <section className="flex flex-col gap-6 p-6">
      <button
        className="flex flex-row items-center gap-2 font-semibold underline-offset-4 duration-200 hover:gap-4 hover:underline lg:hidden"
        onClick={() => $adminPanel.set(null)}
      >
        <MdChevronLeft color="white" className="size-6" />
        Reports Management
      </button>

      <div className="flex h-8 flex-row items-center gap-5 rounded-full bg-medium-navy px-5 text-xs placeholder:text-white/50">
        <MdOutlineSearch color="white" className="size-4" />
        <input
          type="text"
          className="w-full bg-transparent outline-none"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <label className="group flex cursor-pointer flex-row items-center gap-5">
        <input
          type="checkbox"
          name="processed"
          className="m-0 -mr-5 appearance-none p-0 outline-none"
          checked={showProcessed}
          onChange={() => setShowProcessed(!showProcessed)}
        />
        <MdCheckBoxOutlineBlank
          color="white"
          className="block size-6 group-has-[:checked]:hidden"
        />
        <MdCheckBox
          color="white"
          className="hidden size-6 group-has-[:checked]:block"
        />
        Show processed reports
      </label>

      <ReportsList />
    </section>
  );
}
