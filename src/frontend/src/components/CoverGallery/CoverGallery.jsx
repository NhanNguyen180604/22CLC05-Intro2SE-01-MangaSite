import { useEffect, useState } from "react"
import { getCovers } from "../../service/mangaService.js"
import styles from './CoverGallery.module.css';

const CoverGallery = ({ id }) => {
    const [covers, setCovers] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const response = await getCovers(id);
            if (response.status === 200) {
                setCovers(response.covers);
            }
        };

        fetchData();
    }, []);

    return (
        <div className={styles.coverGalleryContainer}>
            {covers.length ? covers.map((cover, index) => (
                <div key={`cover-${index * 2}`} >
                    <img src={cover.imageURL} />
                </div>
            )) : (
                <div className={styles.bigText}>No Art</div>
            )}
        </div>
    )
}
export default CoverGallery