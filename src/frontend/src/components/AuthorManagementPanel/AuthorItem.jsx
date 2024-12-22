import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import AuthorEditing from "./AuthorEditing.jsx";

export default function AuthorItem({
  author,
  isEditing,
  onOpenEditing,
  onEdit,
  cancelEdit,
  onDelete,
}) {
  const { _id, name, publications } = author;

  return (
    <div className="rounded-xl bg-darker-navy lg:bg-dark-navy">
      <div className="rounded-xl bg-medium-navy p-4 text-white">
        <div className="text-base font-semibold">{name}</div>
        {publications && (
          <div className="text-sm font-normal">
            <span className="font-semibold">{publications || 0}</span>{" "}
            publications
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 p-[10px]">
        <MdOutlineEdit
          className="cursor-pointer hover:opacity-60"
          size={24}
          onClick={() => onOpenEditing(_id)}
        />
        <MdDeleteOutline
          className="cursor-pointer hover:opacity-60"
          size={24}
          onClick={() => onDelete(_id)}
        />
      </div>

      <AuthorEditing
        title="Editing Category"
        author={author}
        isOpen={isEditing}
        onEdit={onEdit}
        onCancel={cancelEdit}
      />
    </div>
  );
}
