import { FaRegTrashAlt } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const MangaNode = ({ manga, showDeletePopup }) => {
    const navigate = useNavigate();

    return (
        <div className="relative">
            <div className="grid grid-cols-[70px_minmax(100px,_1fr)] gap-5 bg-medium-navy rounded-xl p-3 items-center relative">
                <div className="h-[90px] justify-self-center">
                    <img
                        src={manga.cover}
                        className="h-full object-cover"
                    />
                </div>
                <div>
                    <div className="font-semibold text-[1.2rem]">{manga.name}</div>
                    <div className="text-very-light-blue text-[0.8rem]">
                        <span className="text-sky-blue font-semibold">Authors:</span> {manga.authors.map(author => author.name).join(', ')}
                    </div>
                </div>
            </div>

            <div className="flex justify-end relative lg:absolute top-0 right-0">
                <div className="flex gap-1 p-2 text-[1.5rem] bg-darker-navy rounded-bl-lg rounded-br-lg lg:bg-dark-navy lg:rounded-tr-lg">
                    <button
                        onClick={() => navigate(`/mangas/${manga._id}/edit`)}
                        className="hover:bg-white/10 duration-200 p-1 rounded-lg"
                    >
                        <LuPencil />
                    </button>
                    <button
                        onClick={() => showDeletePopup(manga._id, manga.name)}
                        className="hover:bg-white/10 duration-200 p-1 rounded-lg"
                    >
                        <FaRegTrashAlt />
                    </button>
                </div>
            </div>
        </div>
    )
}
export default MangaNode;