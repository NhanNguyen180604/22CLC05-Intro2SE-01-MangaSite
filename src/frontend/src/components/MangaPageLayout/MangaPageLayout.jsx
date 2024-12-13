import styles from './MangaPageLayout.module.css';

const MangaPageLayout = ({ children, tag = 'div' }) => {
    const Tag = tag;
    return (
        <Tag className={styles.mangaPageContainer}>
            {children}
        </Tag>
    );
}

const LeftColumnContainer = ({ children }) => {
    return (
        <div className={styles.leftColumnContainer}>
            {children}
        </div>
    );
};

const RightColumnContainer = ({ children }) => {
    return (
        <div className={styles.rightColumnContainer}>
            {children}
        </div>
    );
};

const MangaPageLayoutComponents = {
    MangaPageLayout, LeftColumnContainer, RightColumnContainer
};

export default MangaPageLayoutComponents;