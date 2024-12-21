import { useState } from "react";

export default function AuthorEditing({
  author,
  isOpen,
  onEdit,
  onCancel,
}) {
  const [name, setName] = useState(author.name);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="w-80 rounded-xl bg-blue px-5 py-4 text-white">
        <h4 className="text-base font-semibold">Editing Author</h4>

        <label htmlFor="category-name" className="mt-4 text-sm font-semibold">
          Name
        </label>
        <input
          className="block w-full rounded-xl bg-darker-navy px-3 py-2 text-base font-normal text-white"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          className="mt-4 flex w-full items-center justify-center rounded-full bg-sky-blue py-2 text-base font-semibold text-black hover:opacity-50"
          onClick={() => {
            onEdit(name);
            onCancel();
          }}
        >
          Confirm Changes
        </button>
        <button
          className="mt-2 flex w-full items-center justify-center rounded-full bg-light-red py-2 text-base font-semibold text-black hover:opacity-50"
          onClick={() => onCancel()}
        >
          Discard Changes
        </button>
      </div>
    </div>
  );
}
