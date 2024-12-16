import { FaChevronLeft } from "react-icons/fa6";
import UserManagementSearchBar from "./UserManagementSearchBar.jsx";
import UserContainer from "./UserContainer.jsx";
import { useState } from "react";
import { $adminPanel } from "../../stores/admin-tools.js";


const UserManagement = () => {
    const [search, setSearch] = useState({
        query: '',
        banned: false,
        pendingApproval: false,
    });

    return (
        <div className="w-full h-full p-6">
            <button
                className="flex items-center gap-2 font-semibold underline-offset-4 hover:gap-4 hover:underline duration-200 lg:hidden"
                onClick={() => $adminPanel.set(null)}
            >
                <FaChevronLeft />
                Users Management
            </button>

            <UserManagementSearchBar search={search} setSearch={setSearch} />
            <UserContainer search={search} />
        </div>
    )
}
export default UserManagement;