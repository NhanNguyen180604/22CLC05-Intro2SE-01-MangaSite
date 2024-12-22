import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import CategoryEditing from "./CategoryEditing.jsx";

export default function CategoryItem({
  category,
  isEditing,
  onOpenEditing,
  onEdit,
  cancelEdit,
  onDelete,
}) {
  const { _id, name, publications } = category;

  return (
    <div className="rounded-xl bg-darker-navy lg:bg-dark-navy">
      <div className="rounded-xl bg-medium-navy p-4 text-white">
        <div className="text-base font-semibold">{name}</div>
        <div className="text-sm font-normal">
          <span className="font-semibold">{publications || 0}</span>{" "}
          publications
        </div>
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

      <CategoryEditing
        title="Editing Category"
        category={category}
        isOpen={isEditing}
        onEdit={onEdit}
        onCancel={cancelEdit}
      />
    </div>
  );
}
