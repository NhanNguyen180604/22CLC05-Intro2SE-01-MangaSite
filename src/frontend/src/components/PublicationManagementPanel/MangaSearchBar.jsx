import {
    MdOutlineSearch,
} from "react-icons/md";

const MangaSearchBar = ({ search, setSearch }) => {
    const handleTextInput = (e) => {
        setSearch(e.target.value);
    };

    return (
        <div className="mt-4 mb-6 lg:mt-0">
            <div className="flex-grow flex items-center gap-5 bg-medium-navy px-5 h-8 rounded-full text-xs">
                <MdOutlineSearch color="white" className="size-4" />
                <input
                    placeholder="Search users by name/email"
                    className="w-full bg-transparent outline-none"
                    type='text'
                    value={search}
                    onChange={handleTextInput}
                />
            </div>
        </div>
    )
}
export default MangaSearchBar;