import { useState } from "react";

function SearchTabSelection() {
  const [tab, setTab] = useState("mangas");

  return (
    <div className="-mx-6 grid w-auto grid-cols-2 bg-dark-navy text-center text-sm font-semibold shadow-xl lg:mx-0">
      <label className="w-full from-white/25 to-white/25 py-2 hover:bg-gradient-to-r has-[:checked]:bg-darker-navy">
        <input
          type="radio"
          name="search-tab"
          value="mangas"
          className="m-0 size-0 appearance-none p-0"
          checked={tab == "mangas"}
          onChange={() => setTab("mangas")}
        />
        Mangas
      </label>
      <label className="w-full from-white/25 to-white/25 py-2 hover:bg-gradient-to-r has-[:checked]:bg-darker-navy">
        <input
          type="radio"
          name="search-tab"
          value="chapters"
          className="m-0 size-0 appearance-none p-0"
          checked={tab == "chapters"}
          onChange={() => setTab("chapters")}
        />
        Chapters
      </label>
    </div>
  );
}

export default SearchTabSelection;
