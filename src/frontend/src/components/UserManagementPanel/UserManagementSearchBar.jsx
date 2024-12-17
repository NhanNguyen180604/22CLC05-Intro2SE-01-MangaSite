import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { useState } from "react";
import {
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdOutlineSearch,
} from "react-icons/md";

const UserManagementSearchBar = ({ search, setSearch }) => {
    const [expanded, setExpanded] = useState(true);

    const handleTextInput = (e) => {
        const { value } = e.target;
        setSearch({
            ...search,
            query: value,
        });
    };

    return (
        <div className="mt-4 lg:mt-0">
            <div className="flex items-center gap-5 mb-6 h-8 placeholder:text-white/50">
                <div className="flex-grow flex items-center gap-5 bg-medium-navy px-5 h-8 rounded-full text-xs">
                    <MdOutlineSearch color="white" className="size-4" />
                    <input
                        placeholder="Search users by name/email"
                        className="w-full bg-transparent outline-none"
                        type='text'
                        value={search.query}
                        onChange={handleTextInput}
                    />
                </div>
                <div
                    onClick={() => setExpanded(!expanded)}
                    className="flex gap-3 items-center duration-200 p-2 rounded-full h-8 hover:bg-blue hover:cursor-pointer select-none"
                >
                    {expanded ? <FaChevronUp /> : <FaChevronDown />}
                    <div>
                        Filter
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="flex flex-col gap-2 mb-6">
                    <label className="group flex cursor-pointer flex-row items-center gap-5 select-none">
                        <input
                            type="checkbox"
                            name="approval"
                            className="m-0 -mr-5 appearance-none p-0 outline-none"
                            value={search.pendingApproval}
                            onChange={() => setSearch({
                                ...search,
                                pendingApproval: !search.pendingApproval,
                            })}
                        />
                        <MdCheckBoxOutlineBlank
                            color="white"
                            className="block size-6 group-has-[:checked]:hidden"
                        />
                        <MdCheckBox
                            color="white"
                            className="hidden size-6 group-has-[:checked]:block"
                        />
                        Pending approval
                    </label>
                    <label className="group flex cursor-pointer flex-row items-center gap-5 select-none">
                        <input
                            type="checkbox"
                            name="banned"
                            className="m-0 -mr-5 appearance-none p-0 outline-none"
                            value={search.banned}
                            onChange={() => setSearch({
                                ...search,
                                banned: !search.banned,
                            })}
                        />
                        <MdCheckBoxOutlineBlank
                            color="white"
                            className="block size-6 group-has-[:checked]:hidden"
                        />
                        <MdCheckBox
                            color="white"
                            className="hidden size-6 group-has-[:checked]:block"
                        />
                        Banned
                    </label>
                </div>

            )}
        </div>
    )
}
export default UserManagementSearchBar;