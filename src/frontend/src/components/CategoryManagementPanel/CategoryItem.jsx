import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { deleteCategory, editCategory } from "../../service/categoryService.js";
import CategoryEditing from "./CategoryEditing.jsx";

export default function CategoryItem({
  category,
  isEditing,
  onEdit,
  cancelEdit,
}) {
  const { _id, name, publications } = category;

  const handleEditCategory = async (name) => {
    await editCategory({ _id, name });
  };

  const handleDeleteCategory = async () => {
    await deleteCategory(_id);
  };

  return (
    <div className="rounded-xl lg:bg-dark-navy bg-darker-navy">
      <div className="rounded-xl bg-medium-navy p-4 text-white">
        <div className="text-base font-semibold">{name}</div>
        <div className="text-sm font-normal">
          <span className="font-semibold">{publications}</span> publications
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 p-[10px]">
        <MdOutlineEdit
          className="cursor-pointer hover:opacity-60"
          size={24}
          onClick={() => onEdit(_id)}
        />
        <MdDeleteOutline
          className="cursor-pointer hover:opacity-60"
          size={24}
          onClick={() => handleDeleteCategory()}
        />
      </div>

      <CategoryEditing
        category={category}
        isOpen={isEditing}
        onEdit={handleEditCategory}
        onCancel={cancelEdit}
      />
    </div>
  );
}
