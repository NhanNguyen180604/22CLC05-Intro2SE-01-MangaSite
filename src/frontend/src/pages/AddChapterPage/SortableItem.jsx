import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaCircleXmark } from 'react-icons/fa6';
import styles from './AddChapterPage.module.css';

export const SortableItem = ({ image, removeImage }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    return (
        <div className={styles.pageContainer}>
            <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                style={style}
                className={styles.noTouchAction}
            >
                <img src={image.objectURL} />

            </div>
            <button
                className={styles.removePageBTN}
                onClick={(e) => {
                    e.preventDefault();
                    removeImage(image.id);
                }}
            >
                <FaCircleXmark />
            </button>
        </div>
    );
};
