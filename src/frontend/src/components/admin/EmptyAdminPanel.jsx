export default function EmptyAdminPanel() {
  return (
    <div className="flex size-full h-fit min-h-[33.5rem] flex-col items-center justify-center gap-4 rounded-xl bg-darker-navy">
      <img
        src="/assets/onepiece_luffy.png"
        alt="OnePiece Luffy looking at you being indecisive"
        className="size-48"
      />
      <h2 className="text-xl font-semibold">Pick a category to get started</h2>
    </div>
  );
}
