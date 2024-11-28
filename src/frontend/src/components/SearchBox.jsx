import { useStore } from "@nanostores/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useLocalSWR } from "../service/service.js";
import { $showBlackLayer } from "../stores/black-layer.js";
import { $searchGenres, $searchText } from "../stores/search.js";
import IconSearch from "./icons/IconSearch.jsx";

function SearchFilterList({ tags }) {
  const searchGenres = useStore($searchGenres);
  const selectionsSet = useMemo(() => new Set(searchGenres), [searchGenres]);

  function toggleSelection(key) {
    if (selectionsSet.has(key)) {
      $searchGenres.set(searchGenres.filter((n) => n != key));
    } else {
      $searchGenres.set([...searchGenres, key]);
    }
  }

  return tags.map((tag) => (
    <label
      key={tag.name}
      className={`flex h-4 cursor-pointer items-center justify-center rounded-full bg-sky-blue bg-opacity-50 from-white/50 to-white/50 px-2 text-xxs font-semibold text-black duration-200 hover:bg-gradient-to-r has-[:checked]:bg-opacity-100 has-[:focus]:bg-gradient-to-r lg:h-6 lg:text-sm`}
    >
      <input
        type="checkbox"
        className="m-0 size-0 appearance-none p-0"
        checked={selectionsSet.has(tag.name)}
        onChange={() => toggleSelection(tag.name)}
      />
      {tag.name}
    </label>
  ));
}

function SearchFilterListError() {
  return (
    <div className="h-40 w-full">
      <h2 className="text-xl font-semibold">Error loading tags</h2>
    </div>
  );
}

function SearchFilterListFallback() {
  return [...Array(10)].map((_, idx) => (
    <div
      key={`fallback-${idx}`}
      className="h-4 w-10 animate-pulse rounded-full bg-sky-blue"
      data-testid="category-loading-box"
    ></div>
  ));
}

function SearchFilterDialog() {
  const { data, isLoading, isValidating } = useLocalSWR(
    "/categories?page=1&per_page=40",
  );

  return (
    <div className="absolute -bottom-2 left-0 flex w-full translate-y-full flex-col gap-3 rounded-2xl bg-medium-navy px-6 py-4">
      <h3 className="text-xs font-bold lg:text-base">Genres</h3>
      <div className="flex w-full flex-row flex-wrap gap-2">
        <ErrorBoundary fallback={<SearchFilterListError />}>
          {isLoading || isValidating ? (
            <SearchFilterListFallback />
          ) : data ? (
            <SearchFilterList tags={data.categories} />
          ) : (
            <SearchFilterListError />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

function SearchBox() {
  const [focused, setFocused] = useState(false);
  const searchText = useStore($searchText);
  let searchBox = useRef(null);

  function handler() {
    setFocused(false);
  }

  function search() {
    window.location.href = "/search";
  }

  useEffect(() => {
    $showBlackLayer.set(focused);
    if (focused) document.addEventListener("blackLayerClick", handler);
    else document.removeEventListener("blackLayerClick", handler);
  }, [focused]);

  return (
    <div
      className={`flex h-8 w-full items-center justify-start gap-4 rounded-full border-2 border-transparent bg-medium-navy px-5 text-white has-[:focus]:border-sky-blue lg:h-14 lg:w-[23rem] ${focused ? "relative z-50" : "z-0"}`}
      onKeyDownCapture={(e) => {
        if (e.key == "Escape") {
          setFocused(false);
          searchBox.current.blur();
        }
      }}
    >
      <button className="group" aria-label="Search" onClick={search}>
        <IconSearch className="size-4 fill-icon-white group-hover:fill-sky-blue lg:size-5" />
      </button>

      <input
        type="text"
        className="w-full bg-transparent outline-none placeholder:text-white/50"
        placeholder="Search..."
        name="search"
        ref={searchBox}
        value={searchText}
        onChange={(e) => $searchText.set(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => {
          if (e.key == "Enter") search();
        }}
      />
      {focused && <SearchFilterDialog />}
    </div>
  );
}

export default SearchBox;
