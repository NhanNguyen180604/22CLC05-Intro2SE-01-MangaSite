import DesktopLogo from "../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../components/main/MainLayout.jsx";
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx";
import SearchBox from "../components/search/SearchBox.jsx";
import SearchTabSelection from "../components/search/SearchTabSelection.jsx";

export default function SearchPage() {
  return (
    <MainLayout>
      <header className="flex w-full flex-row items-center justify-between">
        <DesktopLogo />
        <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
          <SearchBox />
          <DesktopNavigationBar />
        </div>
      </header>

      <div className="mt-6 w-full space-y-6 lg:mt-16">
        <h2>Found 69,420 publications and chapters.</h2>
        <SearchTabSelection />
        <section className="flex min-h-64 flex-col items-center justify-center py-8 lg:py-12">
          <img
            src="/assets/book_character_cry.png"
            alt="A torn book crying"
            className="h-64 object-contain"
          />
          <p className="text-2xl font-semibold">There{"'"}s nothing here</p>
        </section>
      </div>

      <footer>
        <MobileNavigationBar />
      </footer>
    </MainLayout>
  );
}
