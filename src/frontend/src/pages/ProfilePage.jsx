import DesktopLogo from "../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../components/main/MainLayout.jsx";
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx";
import { getMangaByUploader } from '../service/mangaService.js';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getUserById } from "../service/userService.js";

const useResponsivePerLoad = () => {
    const [perLoad, setPerLoad] = useState(() => {
        const width = window.innerWidth;
        if (width < 768) return 2;
        if (width < 1024) return 3;
        return 4;
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {setPerLoad(2)}
            else if (width < 1024) {setPerLoad(3)}
            else {setPerLoad(4)};
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return perLoad;
};

const ProfilePage = () => {
    const [user, setUser] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const {id} = useParams();
    const navigate = useNavigate();
    const [mangas, setMangas] = useState([]);
    const perLoad = useResponsivePerLoad();
    const [perPage, setPerPage] = useState(perLoad);
    const [loading, setLoading] = useState(true);
    const resize = useRef(0);

    const fetchData = async (local_page = 1, per_page = 20) => {
        const fetchManga = async () => {
            const mangaResponse = await getMangaByUploader(id, local_page, per_page);
            if (mangaResponse.status === 200) {
                if(page === 1){
                    setMangas(mangaResponse.mangas.mangas);
                }
                else {
                    setMangas([...mangas, ...mangaResponse.mangas.mangas]);
                }
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
        setUser(userResponse.data);
    }
    const loadMore = () => {
        if (page > totalPages) {
            return;
        }

        setPage(prev => prev + 1);
    };
    const loadLess = () => {
        setPage(1);
    };

    useEffect(()=> {
        fetchUser();
    }, []);
    useEffect(() => {
        setPerPage(perLoad);
        if(page === 1){
            resize.current++;
        }
        setPage(1);
    }, [perLoad]);
    useEffect(() => {
        fetchData(page, perPage);
    }, [page, resize.current]);

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
            <div className="mb-20">
                <div className="text-3xl text-white font-bold mt-6 mb-3">Publications</div>
                <div className="flex justify-center w-full">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
                        {mangas.map(manga => (
                                <div key={manga._id}>
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
                </div>
                {page < totalPages && (
                    <div className="mx-auto mt-3 w-1/5 rounded-3xl text-sm text-center bg-blue hover:bg-light-blue p-2 cursor-pointer" onClick={loadMore}>
                        Load more
                    </div>
                )}
                {page > 1 && (
                    <div className="mx-auto mt-3 w-1/5 rounded-3xl text-sm text-center bg-red hover:bg-light-red p-2 cursor-pointer" onClick={loadLess}>
                        Load less
                    </div>
                )}
            </div>
            </>}
            
            <footer>
                <MobileNavigationBar />
            </footer>
        </MainLayout>
    )
}
export default ProfilePage;