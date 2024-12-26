import DesktopLogo from "../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../components/main/MainLayout.jsx";
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx";
import { getMangaByUploader } from '../service/mangaService.js';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserById } from "../service/userService.js";

const ProfilePage = () => {
    const [user, setUser] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const {id} = useParams();
    const navigate = useNavigate();
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async (local_page = 1, per_page = 4) => {
        const fetchManga = async () => {
            const mangaResponse = await getMangaByUploader(id, local_page, per_page);
            if (mangaResponse.status === 200) {
                setMangas([...mangas, ...mangaResponse.mangas.mangas]);
                setTotalPages(mangaResponse.mangas.total_pages);
            }
        }
        await fetchManga();
        setLoading(false);
    };
    const fetchUser = async () => {
        const userResponse = await getUserById(id);
        if(userResponse.data.message){
            return navigate('/404');
        }
        console.log(userResponse)
        setUser(userResponse.data);
    }
    const loadMore = () => {
        if (page > totalPages)
            return;

        setPage(prev => prev + 1);
    };

    useEffect(()=> {
        fetchUser();
    }, []);
    useEffect(() => {
        fetchData(page);
    }, [page]);

    return (
        <MainLayout>
            <header className="flex w-full flex-row items-center justify-between">
                <DesktopLogo />
                <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
                    <DesktopNavigationBar />
                </div>
            </header>
            {loading ? <div className="min-h-screen flex items-center justify-center">Loading...</div>:
            <>
            <div className="flex items-center mt-6 pb-9 border-b">
                <img
                    src={user.avatar.url || 'https://placehold.co/100x100?text=User+Avatar'}
                    alt="Avatar"
                    className="w-52 h-52 rounded-full overflow-hidden group object-cover mr-12"
                />
                <div className="text-lg text-white">
                    <div className="text-3xl mb-3 font-bold">{user.name}</div>
                    <div>Email: {user.email}</div>
                    <div>Role: {user.accountType}</div>
                </div>
            </div>
            <div className="text-3xl text-white font-bold mt-6 mb-3">Publications</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mangas.map(manga => (
                        <div>
                        <img
                            src={manga.cover || 'https://placehold.co/100x100?text=Manga+Cover'}
                            alt={manga.name}
                            onClick={() => {
                                navigate(`/mangas/${manga._id}`);
                            }}
                            className="h-72 w-48 cursor-pointer"
                        />
                        <div className="text-lg font-bold">{manga.name}</div>
                        </div>
                ))}
            </div>
            {page < totalPages && (
                <div className="mx-auto mt-3 w-1/5 rounded-3xl text-xl text-center bg-blue hover:bg-light-blue p-2 cursor-pointer" onClick={loadMore}>
                    Load more
                </div>
            )}
            </>}
            <footer>
                <MobileNavigationBar />
            </footer>
        </MainLayout>
    )
}
export default ProfilePage;