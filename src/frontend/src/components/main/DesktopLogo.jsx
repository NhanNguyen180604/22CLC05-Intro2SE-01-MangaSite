export default function DesktopLogo() {
  return (
    <div className="hidden flex-row items-center gap-6 lg:flex">
      <img
        src="/assets/book_open_yoko.png"
        alt="An open book"
        className="h-16 object-contain"
      />
      <h1 className="font-josefin text-[2rem] font-semibold">Openbook</h1>
    </div>
  );
}
