import propTypes from "prop-types";
import { MdChevronRight } from "react-icons/md";

const AdminTab = function ({ checked, icon, label, onClick }) {
  return (
    <label className="flex w-full cursor-pointer flex-row items-center justify-between px-6 py-5 duration-200 hover:bg-medium-navy lg:py-2 lg:opacity-50 lg:hover:bg-transparent lg:hover:opacity-100 lg:has-[:checked]:opacity-100">
      <div className="flex flex-row items-center gap-2 font-semibold duration-200">
        {icon}
        <input
          type="radio"
          name="users"
          className="m-0 size-0 appearance-none p-0"
          checked={checked}
          onClick={onClick}
        />
        {label}
      </div>

      <MdChevronRight color="white" className="size-6 lg:hidden" />
    </label>
  );
};

AdminTab.propTypes = {
  checked: propTypes.bool,
  icon: propTypes.element,
  label: propTypes.string,
  onClick: propTypes.func,
};

export default AdminTab;
