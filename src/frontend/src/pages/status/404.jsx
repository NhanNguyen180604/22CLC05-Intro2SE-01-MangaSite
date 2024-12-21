import MainLayout from "../../components/main/MainLayout.jsx";

export default function Page404() {
  return (
    <MainLayout>
      <div className="flex h-full flex-col items-center gap-8 text-center">
        <img
          src="/assets/internet_404_page_not_found.png"
          alt="Chirp Chirp! This page doesn't exist."
          className="size-20 lg:size-48"
        />

        <div className="flex flex-col gap-4">
          <h1 className="cursor-pointer bg-gradient-to-r from-pink-300 via-green-500 to-sky-500 bg-clip-text bg-left text-3xl font-bold duration-200 hover:bg-right">
            Uh oh! You hit a roadblock!
          </h1>
          <p className="text-lg font-semibold">
            Did you make a mistake in the link?
          </p>
        </div>

        <a
          href="/"
          className="w-fit rounded-xl bg-sky-blue from-white/50 to-white/50 px-4 py-2 font-semibold text-black hover:bg-gradient-to-r focus:bg-gradient-to-r"
        >
          Go Back...?
        </a>
      </div>
    </MainLayout>
  );
}
