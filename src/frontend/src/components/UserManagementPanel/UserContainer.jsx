import { useState, useEffect } from "react";
import { getUsers, getBannedUsers, getApprovalRequests } from "../../service/userService.js";

import { changeUserRole, banUser, unbanUser } from "../../service/userService.js";
import NotiPopup from "../NotiPopup";
import UserNode from "./UserNode.jsx";

const UserContainer = ({ search }) => {
    const [users, setUsers] = useState([]);
    const [banned, setBanned] = useState([]);
    const [approvalReq, setApprovalReq] = useState([]);
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const perPage = 2;
    const [totalPages, setTotalPages] = useState(100);

    const fetchUsers = async (local_page, per_page) => {
        const response = await getUsers(local_page, per_page);
        if (response) {
            setTotalPages(response.total_pages);
            setUsers([...users, ...response.users]);
        }
        else {
            setNotiDetails({
                success: false,
                message: `Failed to fetch user`,
                details: response.message,
            });
            setShowNoti(true);
        }
    };

    useEffect(() => {
        fetchUsers(page, perPage);
    }, [page]);

    const loadMore = () => {
        if (page < totalPages)
            setPage(prev => prev + 1);
    };

    const initialize = async () => {
        setLoading(true);

        const bannedUserResponse = await getBannedUsers();
        if (bannedUserResponse) {
            setBanned(bannedUserResponse);
        }
        else {
            console.log("Could not get banned user list");
        }

        const approvalResponse = await getApprovalRequests();
        if (approvalResponse) {
            setApprovalReq(approvalResponse);
        }
        else {
            console.log("Could not get the approval request list");
        }

        setLoading(false);
    };

    const changeUserRoleWrapper = async (userID, role) => {
        const response = await changeUserRole(userID, role);
        if (response.status !== 200) {
            setNotiDetails({
                success: false,
                message: `Failed to ${role === 'approved' ? 'approve user' : 'disapprove user'}`,
                details: response.message,
            });
            setShowNoti(true);
        }
        else {
            const copyUsers = [...users];
            const index = users.map(user => user._id).indexOf(userID);
            if (index > -1) {
                copyUsers[index] = {
                    ...copyUsers[index],
                    accountType: role,
                };
                setUsers([...copyUsers]);
            }

            if (role === 'approved') {
                setApprovalReq(approvalReq.filter(approval => approval.user !== userID));
            }
        }
    };

    const banUserWrapper = async (userID, reason) => {
        const response = await banUser(userID, reason);
        if (response.status !== 200) {
            setNotiDetails({
                success: false,
                message: `Failed to ban user`,
                details: response.message,
            });
            setShowNoti(true);
        }
        else {
            setBanned([
                ...banned,
                response.data,
            ])
        }
    };

    const unbanUserWrapper = async (userID) => {
        const response = await unbanUser(userID);
        if (response.status !== 200) {
            setNotiDetails({
                success: false,
                message: `Failed to unban user`,
                details: response.message,
            });
            setShowNoti(true);
        }
        else {
            setBanned(banned.filter(bannedUser => bannedUser.user !== userID));
        }
    };

    const filterUser = (user) => {
        const regex = new RegExp(search.query, "gi");
        let result = Boolean(user.name?.match(regex) || user.email?.match(regex));
        if (search.pendingApproval) {
            result = result && Boolean(approvalReq.some(approval => approval.user === user._id));
        }
        if (search.banned) {
            result = result && Boolean(banned.some(bannedUser => bannedUser.user === user._id));
        }
        return result;
    };

    useEffect(() => {
        initialize();
    }, []);
    return (
        <>
            {loading ? (
                <div className="text-center font-semibold text-[1.2rem] my-3">
                    Loading...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[33.5rem] overflow-y-auto">
                    {users
                        .filter(filterUser)
                        .map((user) => (
                            <UserNode
                                key={user._id}
                                user={user}
                                changeUserRoleWrapper={changeUserRoleWrapper}
                                banUserWrapper={banUserWrapper}
                                unbanUserWrapper={unbanUserWrapper}
                                isBanned={banned.find(bannedUser => bannedUser.user === user._id)}
                                approvalReq={approvalReq.find(element => element.user === user._id)}
                            />
                        ))
                    }

                    {page < totalPages && (
                        <button
                            className="justify-self-center px-[12px] py-[4px] mt-2 border border-2 rounded-full duration-200 hover:bg-white/25"
                            onClick={() => loadMore()}
                        >
                            Show more
                        </button>
                    )}

                    <NotiPopup
                        open={showNoti}
                        onClose={() => setShowNoti(false)}
                        success={notiDetails.success}
                        message={notiDetails.message}
                        details={notiDetails.details}
                    />
                </div>
            )}
        </>

    )
}
export default UserContainer