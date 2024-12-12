import propTypes from "prop-types";
import { MdChevronRight } from "react-icons/md";

const MobileAdminTab = function ({ icon, label }) {
  return (
    <label className="flex w-full cursor-pointer flex-row items-center justify-between px-6 py-5 duration-200 hover:bg-medium-navy">
      <div className="flex flex-row items-center gap-2 duration-200 lg:opacity-50 lg:hover:opacity-100 lg:has-[:checked]:opacity-100">
        {icon}
        <input
          type="radio"
          name="users"
          className="m-0 size-0 appearance-none p-0"
        />
        {label}
      </div>

      <MdChevronRight color="white" className="size-6" />
    </label>
  );
};

MobileAdminTab.propTypes = {
  icon: propTypes.element,
  label: propTypes.string,
};

export default MobileAdminTab;
