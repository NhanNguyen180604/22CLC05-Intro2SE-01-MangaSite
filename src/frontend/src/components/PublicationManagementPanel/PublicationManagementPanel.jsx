import { FaChevronLeft } from "react-icons/fa6";
import { $adminPanel } from "../../stores/admin-tools.js";
import MangaListContainer from "./MangaListContainer.jsx";
import MangaSearchBar from "./MangaSearchBar.jsx";
import { useState } from "react";

const PublicationManagementPanel = () => {
    const [search, setSearch] = useState('');
    return (
        <div className="w-full h-full p-6">
            <button
                className="flex items-center gap-2 font-semibold underline-offset-4 hover:gap-4 hover:underline duration-200 lg:hidden"
                onClick={() => $adminPanel.set(null)}
            >
                <FaChevronLeft />
                Publications Management
            </button>

            <MangaSearchBar search={search} setSearch={setSearch} />
            <MangaListContainer search={search}/>
        </div>
    )
}
export default PublicationManagementPanel;