import styles from "./Tab.module.css";
import React, { useState } from "react";
import PropTypes from "prop-types";

const Tab = ({ children }) => {
    const [activeTab, setActiveTab] = useState(0);
    const childrenArray = React.Children.toArray(children);

    const changeTab = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={styles.tabContainer}>
            {/* tab switching buttons */}
            <div className={styles.tabHeaders}>
                {childrenArray.map((child, index) => (
                    <div
                        key={`tab-header-${index + 1}`}
                        onClick={() => changeTab(index)}
                        className={activeTab === index ? styles.activeHeader : ""}
                    >
                        {child.props.title}
                    </div>
                ))}
            </div>

            <div className={styles.tabContent}>
                {childrenArray.map((child, index) => (
                    <div
                        className={activeTab === index ? "" : styles.inactiveTab}
                        key={`tab-content-${index + 1}`}
                    >
                        {child}
                    </div>
                ))}
            </div>
        </div>
    )
}

const TabPanel = ({ children }) => {
    return (
        <div>{children}</div>
    )
}

const TabComponents = {
    Tab, TabPanel,
}

export default TabComponents

Tab.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
}

TabPanel.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
}