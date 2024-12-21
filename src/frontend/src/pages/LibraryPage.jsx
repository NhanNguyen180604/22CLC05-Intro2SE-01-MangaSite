import { useEffect, useState, useRef } from "react"
import { FaBookmark, FaSlidersH, FaList, FaEllipsisV, FaBookOpen, FaCheckCircle, FaRecycle, FaSortAlphaDown, FaSortDown, FaSortAmountUp} from "react-icons/fa"
import DesktopLogo from "../components/main/DesktopLogo.jsx"
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx"
import MainLayout from "../components/main/MainLayout.jsx"
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx"
import { deleteFromLibrary, getBlacklist, getLibrary, updateLibrary } from "../service/userService.js"
import MySelect from "../components/MySelect/MySelect.jsx"
import { getAllAuthors } from "../service/authorService.js"
import { getAllCategories } from "../service/categoryService.js"
import { FaTrashCan } from "react-icons/fa6"
import { useNavigate } from "react-router-dom"
import { getChapterList, getReadingHistory } from "../service/mangaService.js"
import NotiPopup from "../components/NotiPopup/NotiPopup.jsx"

const LibraryPage = () => {
    const blacklist = useRef();
    const library = useRef();
    const [libraryShow, setLibraryShow] = useState({reading:[], re_reading:[], completed:[]});
    const [loading, setLoading] = useState(true);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [menuShow, setMenuShow] = useState(false);
    const [filterShow, setFilterShow] = useState(false);
    const [sortShow, setSortShow] = useState(false);
    const noData = useRef(false);
    const authorsRef = useRef([]);
    const categoriesRef = useRef([]);
    const [filterList, setFilterList] = useState({authors:[], categories:[]});
    const [sortOption, setSortOption] = useState("");
    const [readingProcess, setReadingProcess] = useState({});
    const [noti, setNoti] = useState({open:false, success:null, message:null});
    const navigate = useNavigate();
    const reload = useRef(0);

    const fetchLibrary = async () => {
        try {
            const res = await getLibrary();
            if (!res) {
                noData.current = true;
                return;
            }
            library.current = resolveReferences(res);
            setLibraryShow(filterAndSortLibrary());          
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };
    const fetchAuthorList = async () => {
        try {
            const response = await getAllAuthors();
            authorsRef.current = response.authors
                                .filter(author=>!(blacklist.current.authors.map(au=>au._id)).includes(author._id))
                                .map((author) => ({
                                    label: author.name,
                                    value: author._id,
                                }));
            console.log(authorsRef.current)
        } catch (error) {
            console.error('Error fetching author list:', error);
        }
    };
    const fetchCategoryList = async () => {
        try {
            const response = await getAllCategories();
            categoriesRef.current = response.categories
                                    .filter(category=>!(blacklist.current.categories.map(cat=>cat._id)).includes(category._id))
                                    .map((category) => ({
                                        label: category.name,
                                        value: category._id,
                                    }));
            console.log(categoriesRef.current)
        } catch (error) {
            console.error('Error fetching author list:', error);
        }
    };
    const fetchBlacklist = async () => {
        try {
            const response = await getBlacklist();
            blacklist.current = response;
        } catch (error) {
            console.error('Error fetching blacklist:', error);
        }
    }

    const toggleFilter = () => {
        setSortShow(false);
        setFilterShow(prev =>!prev);
    }
    const toggleSort = () => {
        setFilterShow(false);
        setSortShow(prev =>!prev);
    }
    const resolveReferences = (library) => {
        const resolveNames = (mangas) =>
          mangas.map((manga) => ({
            ...manga,
            authorNames: manga.authors.map(
              (authorId) =>
                authorsRef.current.find((author) => author.value === authorId)?.label || "Unknown Author"
            ),
            categoryNames: manga.categories.map(
              (categoryId) =>
                categoriesRef.current.find(
                  (category) => category.value === categoryId)?.label || "Unknown Category"
            ),
            readingProcess: getReadingProcess(manga._id)
          }));
      
        return {
          reading: resolveNames(library.reading),
          completed: resolveNames(library.completed),
          re_reading: resolveNames(library.re_reading),
        };
      };
      const filterAndSortLibrary = () => {
        const applyFilters = (mangas) => 
          mangas.filter((manga) => {
            const matchesAuthors = filterList.authors.length
            ? manga.authors.some((id) => 
                filterList.authors.map((author) => author._id).includes(id)
            )
            : true;       
            const matchesCategories = filterList.categories.length
            ? manga.categories.some((id) =>
            filterList.categories.map((category) => category._id).includes(id)
            )
            : true;
      
            return matchesAuthors && matchesCategories;
          });
        const applySort = (mangas) => {
          switch (sortOption) {
            case "name":
              return mangas.sort((a, b) => a.name.localeCompare(b.name));
            case "publish":
              return mangas.sort((a, b) =>
                new Date(a.createdAt) - new Date(b.createdAt)
              );
            default:
              return mangas;
          }
        };
        return {
          reading: applySort(applyFilters(library.current.reading)),
          completed: applySort(applyFilters(library.current.completed)),
          re_reading:applySort(applyFilters(library.current.re_reading)),
        };
      };
      
    const handleSelectChange = (values, field) => {
        setFilterList({
            ...filterList,
            [field]: values.map(value => {
                return {
                    _id: value.value,
                    name: value.label,
                };
            })
        })
    };
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };
    const handleReadLatest = async(id) => {
        const chapterListResponse = await getChapterList(id, 1, 1, true);
        let tempChapterList = chapterListResponse.chaptersInfo.chapters;
        if (chapterListResponse.status !== 200 || tempChapterList.length === 0) {
            showNotiPopup(true, false, "This manga doesn't have any chapters");
        }
        const firstChapter = tempChapterList[0].number;
        const historyResponse = await getReadingHistory(id);
        if (historyResponse.status === 200 && historyResponse.history) {
            const fetchedHistory = historyResponse.history;
            if (fetchedHistory.chapters.length) {
                const tempChapter = tempChapterList.find(element => element._id === fetchedHistory.chapters[fetchedHistory.chapters.length - 1]);
                if (tempChapter)
                    navigate(`/mangas/${id}/chapters/${tempChapter.number}`);
                else navigate(`/mangas/${id}/chapters/${firstChapter}`)
            }
            else navigate(`/mangas/${id}/chapters/${firstChapter}`);
        }
        else navigate(`/mangas/${id}/chapters/${firstChapter}`);
    };
    const getReadingProcess = async(id) => {
        const chapterListResponse = await getChapterList(id, 1, 1, true);
        let tempChapterList = chapterListResponse.chaptersInfo.chapters;
        if (chapterListResponse.status !== 200 || tempChapterList.length === 0) {
            return setReadingProcess((prev) => ({ ...prev, [id]: 0 }));
        }
        const firstChapter = tempChapterList[0].number;
        const historyResponse = await getReadingHistory(id);
        if (historyResponse.status === 200 && historyResponse.history) {
            const fetchedHistory = historyResponse.history;
            if (fetchedHistory.chapters.length) {
                const tempChapter = tempChapterList.find(element => element._id === fetchedHistory.chapters[fetchedHistory.chapters.length - 1]);
                if (tempChapter)
                    return setReadingProcess((prev) => ({ ...prev, [id]: Math.round((tempChapter.number - firstChapter + 1)/tempChapterList.length*100)}));
                else return setReadingProcess((prev) => ({ ...prev, [id]: 0 }));
            }
            else return setReadingProcess((prev) => ({ ...prev, [id]: 0 }));
        }
        return setReadingProcess((prev) => ({ ...prev, [id]: 0 }));
    };
    const handleUpdateLibrary = async(id, tab) => {
        await updateLibrary(id, tab);
        tab = tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', '-');
        showNotiPopup(true, true, `Move manga to ${tab} tab successfully`);
        reload.current++;
    }
    const handleDeleteFromLibrary = async(id, tab) => {
        await deleteFromLibrary(id, tab)
        showNotiPopup(true, true, "Delete manga from library successfully");
        reload.current++;
    }
    const handleDisplayLibrary = () => {
        setFilterShow(false);
        setSortShow(false);
        setLibraryLoading(true);
        setLibraryShow(filterAndSortLibrary());
        setLibraryLoading(false);
        showNotiPopup(true, true, "Organize manga in library successfully");
    };
    const showNotiPopup = (open, success, message) => {
        const noti = {open, success, message};
        setNoti(noti);
    }

    useEffect(() => {
        setLoading(true);
        fetchBlacklist();
        fetchAuthorList();
        fetchCategoryList();
        setLoading(false);
    }, [blacklist.current]);
    useEffect(() => {
        setLibraryLoading(true);
        fetchLibrary();
        setLibraryLoading(false);
    }, [reload.current]);

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
                <div className="mx-auto text-5xl text-white text-center font-bold">You haven't logged in!</div>
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
            <span><NotiPopup open={noti.open} onClose={()=>setNoti({open:false})} success={noti.success} message={noti.message}></NotiPopup></span>
            <div className="flex justify-between items-center my-6 pb-3 text-3xl font-bold border-b">
                <div className="flex space-x-2"><FaBookmark /><div>Library</div></div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <FaSlidersH className={`${filterShow ? "text-white" : "text-gray-400"} hover:text-white`} onClick={toggleFilter}/>
                        {filterShow && <div className="absolute right-0 mt-2 bg-darker-navy p-2 text-sm w-96 z-10">                                  
                        <div>Filter by authors</div>
                        <MySelect
                            options={authorsRef.current}
                            isLoading={loading}
                            onChange={(values) => handleSelectChange(values, 'authors')}
                            value={filterList.authors.map(author => ({
                                label: author.name,
                                value: author._id,
                            }))}
                        />
                        <div>Filter by categories</div>
                        <MySelect
                            options={categoriesRef.current}
                            isLoading={loading}
                            onChange={(values) => handleSelectChange(values, 'categories')}
                            value={filterList.categories.map(category => ({
                                label: category.name,
                                value: category._id,
                            }))}
                        />
                        <div className="flex justify-end space-x-2">
                            <div className="rounded-3xl text-sm bg-blue hover:bg-light-blue p-2 cursor-pointer" onClick={handleDisplayLibrary}>Confirm</div>
                            <div className="rounded-3xl text-sm bg-gray-700 hover:bg-gray-500 p-2 cursor-pointer" onClick={toggleFilter}>Cancel</div>
                        </div>
                        </div>
                        }
                    </div>
                    <div className="relative">
                    <FaList className={`${sortShow ? "text-white" : "text-gray-400"} hover:text-white`} onClick={toggleSort}/>
                    {sortShow && (<div className="absolute right-0 mt-2 bg-darker-navy p-2 text-sm w-96 h-44 z-10">
                    <div>Sort by</div>
                    <div className="flex flex-col justify-between h-5/6">
                    <select id="sortby" className="bg-darker-navy text-white text-sm focus:ring-white block w-full p-3 my-2" value={sortOption} onChange={handleSortChange}>
                        <option value="">No sort</option>
                        <option value="name">Name</option>
                        <option value="publish">Published Date</option>
                    </select>
                    <div className="flex justify-end space-x-2">
                        <div className="rounded-3xl text-sm bg-blue hover:bg-light-blue p-2 cursor-pointer" onClick={handleDisplayLibrary}>Confirm</div>
                        <div className="rounded-3xl text-sm bg-gray-700 hover:bg-gray-500 p-2 cursor-pointer" onClick={toggleSort}>Cancel</div>
                    </div>
                    </div>
                    </div>)} 
                    </div>
                </div>
            </div>
            {!libraryLoading ? (<>
            <div className="text-3xl text-white font-bold my-3">Reading</div>
            <div className="flex flex-wrap justify-start gap-12 w-full">
                {
                    libraryShow.reading.map((manga) =>(
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white bg-opacity-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 object-cover"></div>
                                <img
                                src={manga.cover}
                                alt={manga.name}
                                key={manga._id}
                                onClick={() => {
                                    navigate(`/mangas/${manga._id}`);
                                }}
                                className="h-72 w-48 cursor-pointer"
                                />
                                <div className="absolute top-0 right-0 bg-light-blue text-white text-sm font-bold px-2 py-4" style={{
                                    clipPath: "polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)"
                                }}>
                                   {readingProcess[manga._id] + '%'} 
                                </div>
                                <div className="absolute bottom-2 right-1 p-1 text-xl hover:text-blue cursor-pointer"><FaEllipsisV onClick={()=>setMenuShow(manga._id)}/></div>
                                {menuShow === manga._id &&(
                                    <div
                                    className="absolute bottom-2 right-1 p-1 flex justify-between space-x-4 text-xl bg-light-blue rounded-md"
                                    onBlur={() => setMenuShow(false)}
                                    tabIndex={0}
                                    >
                                        <FaTrashCan className="hover:text-blue cursor-pointer" onClick={()=>handleDeleteFromLibrary(manga._id, 'reading')}/>
                                        <FaCheckCircle className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 'completed')}/>
                                        <FaRecycle className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 're_reading')}/>
                                        <FaBookmark className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 'reading')}/>
                                        <FaBookOpen className="hover:text-blue cursor-pointer" onClick={()=>handleReadLatest(manga._id)}/>
                                        <FaEllipsisV  className="hover:text-blue cursor-pointer" onClick={()=>setMenuShow(null)}/>                                       
                                    </div>)}
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="text-3xl text-white font-bold my-3">Re-reading</div>
            <div className="flex flex-wrap justify-start gap-12 w-full">
                {
                    libraryShow.re_reading.map((manga) =>(
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white bg-opacity-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 object-cover"></div>
                                <img
                                src={manga.cover}
                                alt={manga.name}
                                key={manga._id}
                                onClick={() => {
                                    navigate(`/mangas/${manga._id}`);
                                }}
                                className="h-72 w-48 cursor-pointer"
                                />
                                <div className="absolute top-0 right-0 bg-light-blue text-white text-sm font-bold px-2 py-4" style={{
                                    clipPath: "polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)"
                                }}>
                                   {readingProcess[manga._id]+'%'} 
                                </div>
                                <div className="absolute bottom-2 right-1 p-1 text-xl hover:text-blue cursor-pointer"><FaEllipsisV onClick={()=>setMenuShow(manga._id)}/></div>
                                {menuShow === manga._id &&(
                                    <div
                                    className="absolute bottom-2 right-1 p-1 flex justify-between space-x-4 text-xl bg-light-blue rounded-md"
                                    onBlur={() => setMenuShow(false)}
                                    tabIndex={0}
                                    >
                                        <FaTrashCan className="hover:text-blue cursor-pointer" onClick={()=>handleDeleteFromLibrary(manga._id, 're_reading')}/>
                                        <FaCheckCircle className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 'completed')}/>
                                        <FaRecycle className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 're_reading')}/>                                        
                                        <FaBookmark className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 'reading')}/>
                                        <FaBookOpen className="hover:text-blue cursor-pointer" onClick={()=>handleReadLatest(manga._id)}/>
                                        <FaEllipsisV  className="hover:text-blue cursor-pointer" onClick={()=>setMenuShow(null)}/>                                       
                                    </div>)}
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="text-3xl text-white font-bold my-3">Completed</div>
            <div className="flex flex-wrap justify-start gap-12 w-full">
                {
                    libraryShow.completed.map((manga) =>(
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white bg-opacity-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 object-cover"></div>
                                <img
                                src={manga.cover}
                                alt={manga.name}
                                key={manga._id}
                                onClick={() => {
                                    navigate(`/mangas/${manga._id}`);
                                }}
                                className="h-72 w-48 cursor-pointer"
                                />
                                <div className="absolute top-0 right-0 bg-light-blue text-white text-sm font-bold px-2 py-4" style={{
                                    clipPath: "polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)"
                                }}>
                                   100% 
                                </div>
                                <div className="absolute bottom-2 right-1 p-1 text-xl hover:text-blue cursor-pointer"><FaEllipsisV onClick={()=>setMenuShow(manga._id)}/></div>
                                {menuShow === manga._id &&(
                                    <div
                                    className="absolute bottom-2 right-1 p-1 flex justify-between space-x-4 text-xl bg-light-blue rounded-md"
                                    onBlur={() => setMenuShow(false)}
                                    tabIndex={0}
                                    >
                                        <FaTrashCan className="hover:text-blue cursor-pointer" onClick={()=>handleDeleteFromLibrary(manga._id, 'completed')}/>
                                        <FaCheckCircle className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 'completed')}/>
                                        <FaRecycle className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 're_reading')}/>                       
                                        <FaBookmark className="hover:text-blue cursor-pointer" onClick={()=>handleUpdateLibrary(manga._id, 'reading')}/>
                                        <FaBookOpen className="hover:text-blue cursor-pointer" onClick={()=>handleReadLatest(manga._id)}/>
                                        <FaEllipsisV  className="hover:text-blue cursor-pointer" onClick={()=>setMenuShow(null)}/>                                       
                                    </div>)}
                            </div>
                        </div>
                    ))
                }
            </div></>):<div className="min-h-screen flex items-center justify-center text-xl">Library is loading...</div>}
            <footer>
                <MobileNavigationBar />
            </footer>
        </MainLayout>
    )
}
export default LibraryPage