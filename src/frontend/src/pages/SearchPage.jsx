import DesktopLogo from "../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../components/main/MainLayout.jsx";
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx";
import SearchBox from "../components/search/SearchBox.jsx";
import SearchQueryDisplay from "../components/search/SearchQueryDisplay.jsx";

export default function SearchPage() {
  /*
  It's made so that the search only is fetched once per page load, to refresh
  the search, a page reload is necessary.

  All params needed for the search are in localStorage, synced with nanostores
  to allow search states to persist through page changes.

  The search happens in <SearchQueryDisplay />.
  */

  return (
    <MainLayout>
      <header className="flex w-full flex-row items-center justify-between">
        <DesktopLogo />
        <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
          <SearchBox />
          <DesktopNavigationBar />
        </div>
      </header>
      <SearchQueryDisplay />
      <footer>
        <MobileNavigationBar />
      </footer>
    </MainLayout>
  );
}
