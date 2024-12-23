import { useEffect, useState } from "react";
import { MdChevronLeft, MdOutlineSearch } from "react-icons/md";
import { $adminPanel } from "../../stores/admin-tools.js";
import { FaPlus } from "react-icons/fa";
import CategoryItem from "./AuthorItem.jsx";
import { deleteAuthor, editAuthor, getAllAuthors, postNewAuthor } from "../../service/authorService.js";
import AuthorEditing from "./AuthorEditing.jsx";

function AuthorPanel() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState();
  const [authors, setAuthors] = useState([])
  const [isCreating, setCreating] = useState(false)

  useEffect(() => {
    (async () => {
      const res = await getAllAuthors()
      if (res.status === 200) {
        setAuthors(res.authors)
      }
    })()
  }, [])

  const handleCreate = async (_id, name) => {
    const res = await postNewAuthor(name)
    if (res?.status === 200) {
      setAuthors([...authors, res.author])
    }
  }

  const handleEdit = async (id, name) => {
    await editAuthor({id, name})
    setAuthors((authors) =>
      authors.map((author) =>
        author._id === id ? { ...author, name: name } : author,
      ),
    );
  }

  const handleDelete = async (id) => {
    await deleteAuthor(id);
    setAuthors(authors => authors.filter(author => author._id !== id))
  }

  return (
    <section className="flex flex-col gap-6 p-6">
      <button
        className="flex flex-row items-center gap-2 font-semibold underline-offset-4 duration-200 hover:gap-4 hover:underline lg:hidden"
        onClick={() => $adminPanel.set(null)}
      >
        <MdChevronLeft color="white" className="size-6" />
        Author Management
      </button>

      <div className="flex h-8 flex-row items-center gap-5 rounded-full bg-medium-navy px-5 text-xs placeholder:text-white/50">
        <MdOutlineSearch color="white" className="size-4" />
        <input
          type="text"
          className="w-full bg-transparent outline-none"
          placeholder="Search authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button className="ml-auto flex flex-row items-center justify-center gap-1 rounded-full bg-very-light-blue px-3 py-1 font-semibold text-black hover:bg-light-blue"
        onClick={() => setCreating(true)}
      >
        <FaPlus size={12} />
        Create
      </button>

      <AuthorEditing
        title="Create Author"
        author={{name: ''}}
        isOpen={isCreating}
        onEdit={handleCreate}
        onCancel={() => setCreating(false)}
      />

      <div className="flex max-h-[400px] flex-col items-center overflow-y-scroll">
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {authors
            .filter((author) =>
              author.name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((author) => (
              <CategoryItem
                key={author._id}
                author={author}
                isEditing={editing === author._id}
                onOpenEditing={(id) => setEditing(id)}
                onEdit={handleEdit}
                cancelEdit={() => setEditing(null)}
                onDelete={handleDelete}
              />
            ))}
        </div>

        {/* <button className="mt-4 rounded-full border-2 border-very-light-blue px-2 py-1 font-semibold text-white hover:opacity-60"> */}
        {/*   Show More */}
        {/* </button> */}
      </div>
    </section>
  );
}

export default AuthorPanel;
