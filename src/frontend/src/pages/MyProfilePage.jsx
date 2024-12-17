import { useEffect, useState, useRef } from "react"
import { FaUpload } from "react-icons/fa"
import DesktopLogo from "../components/main/DesktopLogo.jsx"
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx"
import MainLayout from "../components/main/MainLayout.jsx"
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx"
import { changeAvatar, getBlacklist, getMe, putBlacklist, putMe } from "../service/userService.js"
import NotiPopup from "../components/NotiPopup/NotiPopup.jsx"
import MySelect from "../components/MySelect/MySelect.jsx"
import { getAllAuthors } from "../service/authorService.js"
import { getAllCategories } from "../service/categoryService.js"

const MyProfilePage = () => {
    const profile = useRef();
    const [form, setForm] = useState({});
    const [previewAvatar, setPreviewAvatar] = useState();
    const avatarFile = useRef();
    const blacklist = useRef();
    const [updatedBlacklist, setUpdatedBlacklist] = useState();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const noData = useRef(false);
    const [showSavingPopUp, setShowSavingPopUp] = useState(false);
    const [showErrorSavingPopUp, setShowErrorSavingPopUp] = useState(false);
    const [showDiscardPopUp, setShowDiscardPopUp] = useState(false);
    const authorsRef = useRef([]);
    const [authorLoading, setAuthorLoading] = useState(true);
    const categoriesRef = useRef([]);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const fileInputRef = useRef();
    const reload = useRef(0);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setPreviewAvatar();
            const response = await getMe();
            if (!response) {
                noData.current = true;
                return;
            }
            const resblacklist = await getBlacklist();
            blacklist.current = resblacklist;
            setUpdatedBlacklist(resblacklist);
            profile.current = response;
            setForm(response);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchAuthorList = async () => {
        try {
            const response = await getAllAuthors();
            authorsRef.current = response.authors.map((author) => ({
                label: author.name,
                value: author._id,
            }));
            setAuthorLoading(false);
        } catch (error) {
            console.error('Error fetching author list:', error);
        }
    };
    const fetchCategoryList = async () => {
        try {
            const response = await getAllCategories();
            categoriesRef.current = response.categories.map((category) => ({
                label: category.name,
                value: category._id,
            }));
            setCategoryLoading(false);
        } catch (error) {
            console.error('Error fetching author list:', error);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!form.email.trim() || !form.name.trim()) {
                setShowErrorSavingPopUp(true);
                return;
            }
            const response = await putMe(form.email, form.name);
            if (previewAvatar) {
                const avatar = await changeAvatar(avatarFile.current);
                response.avatar = avatar;
            }
            const newBlacklist = {
                authors: [],
                categories: []
            }
            updatedBlacklist.authors.map(author => newBlacklist.authors.push(author._id));
            updatedBlacklist.categories.map(category => newBlacklist.categories.push(category._id));
            await putBlacklist(newBlacklist);
            setShowSavingPopUp(true);
        } catch (error) {
            console.error("Error saving profile data:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
            reload.current++;
        }
    };
    const handleDiscard = () => {
        setForm(profile.current);
        setUpdatedBlacklist(blacklist.current);
        setPreviewAvatar();
        setShowDiscardPopUp(true);
    };
    const handleImageClick = () => {
        fileInputRef.current.click();
    };
    const handleUploadImage = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewAvatar(e.target.result);
            };
            reader.readAsDataURL(file);
        }
        const formData = new FormData();
        formData.append('avatar', file);
        avatarFile.current = formData;
    };
    const handleSelectChange = (values, field) => {
        setUpdatedBlacklist({
            ...updatedBlacklist,
            [field]: values.map(value => {
                return {
                    _id: value.value,
                    name: value.label,
                };
            })
        })
    };

    useEffect(() => {
        fetchProfile();
    }, [reload.current]);

    useEffect(() => {
        fetchAuthorList();
        fetchCategoryList();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    if (noData.current) {
        return (
            <MainLayout>
                <header className="flex w-full flex-row items-center justify-between">
                    <DesktopLogo />
                    <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
                        <DesktopNavigationBar />
                    </div>
                </header>
                <img
                    src="../assets/book_character_cry.png"
                    alt="Book Character Cry"
                    className="mx-auto w-64 mt-28"
                />
                <div className="mx-auto text-5xl text-white font-bold">You haven't logged in!</div>
            </MainLayout>
        )
    }
    return (
        <MainLayout>
            <header className="flex w-full flex-row items-center justify-between">
                <DesktopLogo />
                <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
                    <DesktopNavigationBar />
                </div>
            </header>

            <span><NotiPopup open={showDiscardPopUp} onClose={() => setShowDiscardPopUp(false)} success={true} message={"Discard changes successfully!"}></NotiPopup></span>
            <span><NotiPopup open={showSavingPopUp} onClose={() => setShowSavingPopUp(false)} success={true} message={"Save changes successfully!"}></NotiPopup></span>
            <span><NotiPopup open={showErrorSavingPopUp} onClose={() => setShowErrorSavingPopUp(false)} success={false} message={"Email or name cannot be blank!"}></NotiPopup></span>

            <form className="mt-6 mx-auto w-full px-4" onSubmit={handleSave}>
                <div
                    className="mx-auto my-6 relative w-52 h-52 rounded-full overflow-hidden group"
                    onClick={handleImageClick}
                >
                    <img
                        src={previewAvatar ? previewAvatar : form.avatar?.url || 'https://placehold.co/100x100?text=User+Avatar'}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FaUpload className="text-4xl" />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        name="avatar"
                        ref={fileInputRef}
                        onChange={handleUploadImage}
                        className="hidden"
                    />
                </div>

                <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-xl mb-2 font-bold">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="name"
                                className="w-full px-4 py-2 rounded bg-darker-navy text-white focus:outline-none focus:ring-1 focus:ring-white"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xl mb-2 font-bold">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                className="w-full px-4 py-2 rounded bg-darker-navy text-white focus:outline-none focus:ring-1 focus:ring-white"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-xl mb-2 font-bold">
                                Role
                            </label>
                            <input
                                id="role"
                                type="text"
                                name="accountType"
                                className="w-full px-4 py-2 rounded bg-darker-navy text-white"
                                value={form.accountType}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="block text-xl font-bold">Blocked Authors</div>
                        <MySelect
                            options={authorsRef.current}
                            isLoading={authorLoading}
                            onChange={(values) => handleSelectChange(values, 'authors')}
                            value={updatedBlacklist.authors.map(author => ({
                                label: author.name,
                                value: author._id,
                            }))}
                        />

                        <div className="block text-xl font-bold">Blocked Categories</div>
                        <MySelect
                            options={categoriesRef.current}
                            isLoading={categoryLoading}
                            onChange={(values) => handleSelectChange(values, 'categories')}
                            value={updatedBlacklist.categories.map(category => ({
                                label: category.name,
                                value: category._id,
                            }))}
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center space-y-4">
                    <button
                        type="submit"
                        className={`w-full max-w-xl py-2 px-6 rounded-3xl ${saving ? "bg-gray-500 cursor-not-allowed" : "bg-blue hover:bg-light-blue"
                            } text-white`}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                        type="button"
                        className="w-full max-w-xl py-2 px-6 bg-red text-white rounded-3xl hover:bg-light-red"
                        onClick={handleDiscard}
                    >
                        Discard changes
                    </button>
                </div>
            </form>

            <footer>
                <MobileNavigationBar />
            </footer>
        </MainLayout>
    )
}
export default MyProfilePage