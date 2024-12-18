import { useState, useEffect } from "react";
import { secondSearch } from "../../service/searchService.js";
import { deleteManga } from "../../service/mangaService.js";
import MangaNode from "./MangaNode.jsx";
import NotiPopup from "../NotiPopup";
import DeletePopup from "../DeletePopup";

const MangaListContainer = ({ search }) => {
    const [mangas, setMangas] = useState([]);
    const [page, setPage] = useState(1);
    const perPage = 2;
    const [totalPages, setTotalPages] = useState(100);
    const [loading, setLoading] = useState(true);
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const fetchManga = async (type = 'append', page, perPage) => {
        const mangaResponse = await secondSearch(search, page, perPage);
        if (!mangaResponse) {
            console.log("Failed to fetch manga, please try again");
        }

        if (type === 'append')
            setMangas([...mangas, ...mangaResponse.mangas]);
        else setMangas(mangaResponse.mangas);

        setPage(page);
        setTotalPages(mangaResponse.total_pages);
        setLoading(false);
    };

    const debounce = (callback, wait) => {
        let timeoutId = null;
        return (...args) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                callback(...args);
            }, wait);
        };
    }

    const loadMore = () => {
        if (page < totalPages)
            setPage(prev => prev + 1);
    };

    const [delPopupDetails, setDelPopupDetails] = useState({
        show: false,
        loading: false,
        onClose: () => { },
        message: '',
        callback: () => { },
    });

    const showDeletePopup = (mangaID, mangaTitle) => {
        setDelPopupDetails({
            show: true,
            loading: false,
            onClose: () => {
                setDelPopupDetails({
                    ...delPopupDetails,
                    show: false,
                    loading: false,
                });
            },
            message: `You are about to delete the manga ${mangaTitle}.`,
            callback: () => deleteMangaWrapper(mangaID),
        });
    };

    const deleteMangaWrapper = async (mangaID) => {
        setDelPopupDetails({
            ...delPopupDetails,
            loading: true,
            show: true,
        });

        const response = await deleteManga(mangaID);

        setDelPopupDetails({
            ...delPopupDetails,
            loading: false,
            show: false,
        });

        if (response.status !== 200) {
            setNotiDetails({
                success: false,
                message: `Failed to delete manga`,
                details: response.message,
            });
            setShowNoti(true);
            return;
        }

        setMangas(mangas.filter(manga => manga._id !== mangaID));
    }

    useEffect(() => {
        fetchManga('append', page, perPage);
    }, [page]);

    useEffect(() => {
        debounce(fetchManga('new', 1, perPage), 250);
    }, [search]);

    return (
        <>
            {loading ? (
                <div className="text-center font-semibold text-[1.2rem] my-3">
                    Loading...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[33.5rem] overflow-y-auto">
                    {mangas.map(manga => (
                        <MangaNode manga={manga} key={manga._id} showDeletePopup={showDeletePopup} />
                    ))}

                    {page < totalPages && (
                        <button
                            className="justify-self-center border-solid border-2 px-[12px] py-[4px] rounded-full text-[1rem] duration-200 hover:bg-white/25"
                            onClick={loadMore}
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

                    <DeletePopup
                        open={delPopupDetails.show}
                        onClose={delPopupDetails.onClose}
                        message={delPopupDetails.message}
                        callback={delPopupDetails.callback}
                        loading={delPopupDetails.loading}
                    />
                </div>
            )}
        </>
    )
}
export default MangaListContainer;