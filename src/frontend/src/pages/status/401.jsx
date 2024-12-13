import MainLayout from "../../components/main/MainLayout.jsx";

export default function Page401() {
  return (
    <MainLayout>
      <div className="flex h-full flex-col items-center gap-8 text-center">
        <img
          src="/assets/tachiiri_kinshi_tape.png"
          alt="立入禁止のだ。出てけアホ"
          className="size-20 lg:size-48"
        />

        <div className="flex flex-col gap-4">
          <h1 className="cursor-pointer bg-gradient-to-r from-pink-300 via-green-500 to-sky-500 bg-clip-text bg-left text-3xl font-bold duration-200 hover:bg-right">
            Where does bro thing bro is going?
          </h1>
          <p className="text-lg font-semibold">You are not allowed here!</p>
        </div>

        <a
          href="/"
          className="w-fit rounded-xl bg-sky-blue px-4 py-2 font-semibold text-black"
        >
          Go Back...?
        </a>
      </div>
    </MainLayout>
  );
}
