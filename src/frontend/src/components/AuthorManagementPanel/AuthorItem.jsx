import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import AuthorEditing from "./AuthorEditing.jsx";
import { deleteAuthor, editAuthor } from "../../service/authorService.js";

export default function AuthorItem({
  author,
  isEditing,
  onEdit,
  cancelEdit,
}) {
  const { _id, name, publications } = author;

  const handleEditAuthor = async (name) => {
    await editAuthor({ _id, name });
  };

  const handleDeleteAuthor = async () => {
    await deleteAuthor(_id);
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
          onClick={() => handleDeleteAuthor()}
        />
      </div>

      <AuthorEditing
        author={author}
        isOpen={isEditing}
        onEdit={handleEditAuthor}
        onCancel={cancelEdit}
      />
    </div>
  );
}
