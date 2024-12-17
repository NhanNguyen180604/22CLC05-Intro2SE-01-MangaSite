import { FaUser, FaUserSlash } from "react-icons/fa6";
import { TbAwardFilled, TbAwardOff } from "react-icons/tb";
import { useState, useRef, useEffect } from "react";

const UserNode = ({ user, changeUserRoleWrapper, banUserWrapper, unbanUserWrapper, isBanned, approvalReq }) => {
    const [showReport, setShowReport] = useState(false);
    const reasonInputRef = useRef(null);

    const [reason, setReason] = useState('');

    const handleInput = (e) => {
        const { value } = e.target;
        setReason(value);
    };

    const submitReport = async () => {
        setShowReport(false);
        setReason('');
        banUserWrapper(user._id, reason);
    }

    useEffect(() => {
        if (showReport)
            reasonInputRef.current?.focus();
    }, [showReport]);

    return (
        <div className="relative">
            <div className="flex gap-5 bg-medium-navy rounded-xl p-3 items-center relative">
                <img
                    src={user.avatar?.url ? user.avatar.url : 'https://placehold.co/64x64?text=User%20Avatar'}
                    className="object-cover h-[64px] rounded-full"
                />
                <div className="flex flex-col">
                    <div className="font-semibold text-[1.2rem]">{user.name}</div>
                    <div className="text-white/75 text-[0.75rem] mb-2">{user.email}</div>
                    {!isBanned ? (
                        <>
                            {user.accountType === 'approved' ? (
                                <div className={`text-light-green flex items-center gap-2`}>
                                    <TbAwardFilled />
                                    {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)}
                                </div>
                            ) : (
                                <div className={`text-white flex items-center gap-2`}>
                                    <FaUser />
                                    {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={`text-light-red flex items-center gap-2`}>
                            <FaUserSlash />
                            Banned
                        </div>
                    )}
                    {approvalReq && (
                        <div className="text-light-green mt-2 text-[0.8rem]">
                            Pending approval, reason: {approvalReq.reason}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end relative lg:absolute top-0 right-0">
                <div className="flex gap-1 p-2 text-[1.5rem] bg-darker-navy rounded-bl-lg rounded-br-lg lg:bg-dark-navy lg:rounded-tr-lg">
                    {!isBanned ? (
                        <>
                            {user.accountType === 'approved' ? (
                                <button
                                    className="hover:bg-white/10 duration-200 p-1 rounded-lg"
                                    onClick={() => changeUserRoleWrapper(user._id, 'user')}
                                >
                                    <TbAwardOff />
                                </button>
                            ) : (
                                <button
                                    className="hover:bg-white/10 duration-200 p-1 rounded-lg"
                                    onClick={() => changeUserRoleWrapper(user._id, 'approved')}
                                >
                                    <TbAwardFilled />
                                </button>
                            )}
                            <button
                                className="hover:bg-white/10 duration-200 p-1 rounded-lg"
                                onClick={() => setShowReport(!showReport)}
                            >
                                <FaUserSlash />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="hover:bg-white/10 duration-200 p-1 rounded-lg"
                                onClick={() => unbanUserWrapper(user._id)}
                            >
                                <FaUser />
                            </button>
                        </>
                    )}
                </div>
                {showReport &&
                    <div className="absolute right-0 bottom-0 translate-y-full z-50 flex gap-2">
                        <input
                            className="bg-sky-blue text-black px-2 py-1 placeholder-black/50 rounded-lg outline-none"
                            ref={reasonInputRef}
                            type='text'
                            placeholder="Reason for reporting"
                            value={reason}
                            onChange={handleInput}
                        />
                        <button
                            className={`bg-light-red px-2 rounded-lg text-black font-semibold hover:bg-red duration-200 disabled:opacity-50 disabled:pointer-events-none`}
                            disabled={!reason.length}
                            onClick={submitReport}
                        >
                            Submit
                        </button>
                    </div>
                }
            </div>
        </div >
    )
}
export default UserNode;