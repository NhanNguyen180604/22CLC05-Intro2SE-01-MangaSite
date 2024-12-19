import { useState } from "react";
import { MdChevronLeft, MdOutlineSearch } from "react-icons/md";
import { $adminPanel } from "../../stores/admin-tools.js";
import { FaPlus } from "react-icons/fa";
import CategoryItem from "./CategoryItem.jsx";

function CategoryPanel() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState();

  const categories = Array.from({ length: 8 }, (_, i) => ({
    _id: i,
    name: `Category ${i}`,
    publications: i * 200,
  }));

  return (
    <section className="flex flex-col gap-6 p-6">
      <button
        className="flex flex-row items-center gap-2 font-semibold underline-offset-4 duration-200 hover:gap-4 hover:underline lg:hidden"
        onClick={() => $adminPanel.set(null)}
      >
        <MdChevronLeft color="white" className="size-6" />
        Category Management
      </button>

      <div className="flex h-8 flex-row items-center gap-5 rounded-full bg-medium-navy px-5 text-xs placeholder:text-white/50">
        <MdOutlineSearch color="white" className="size-4" />
        <input
          type="text"
          className="w-full bg-transparent outline-none"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button className="ml-auto flex flex-row items-center justify-center gap-1 rounded-full bg-very-light-blue px-3 py-1 font-semibold text-black hover:bg-light-blue">
        <FaPlus size={12} />
        Create
      </button>

      <div className="flex max-h-[400px] flex-col items-center overflow-y-scroll">
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {categories.map((category) => (
            <CategoryItem
              key={category._id}
              category={category}
              isEditing={editing === category._id}
              onEdit={(id) => setEditing(id)}
              cancelEdit={() => setEditing(null)}
            />
          ))}
        </div>

        <button className="mt-4 rounded-full border-2 border-very-light-blue px-2 py-1 font-semibold text-white hover:opacity-60">
          Show More
        </button>
      </div>
    </section>
  );
}

export default CategoryPanel;
