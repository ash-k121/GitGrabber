import React, { useState } from 'react';
import './styles.css'; // Import your styles

const DirectoryTree = ({ data, onFileSelect }) => {
    const [openFolders, setOpenFolders] = useState({});
    const [checkedItems, setCheckedItems] = useState({}); // State for checked items

    const toggleFolder = (folderPath) => {
        setOpenFolders(prev => ({
            ...prev,
            [folderPath]: !prev[folderPath]
        }));
    };

    const handleCheckboxChange = (value, isChecked) => {
        setCheckedItems(prev => ({
            ...prev,
            [value]: isChecked
        }));
        onFileSelect(value, isChecked); // Call the onFileSelect function
    };

    const renderTree = (nodes, path = '') => {
        return Object.entries(nodes).map(([key, value]) => {
            const currentPath = `${path}${key}/`;
            if (typeof value === 'object') {
                // Determine if the folder is checked based on children
                const isChecked = Object.keys(value).every(childKey => checkedItems[`${currentPath}${childKey}`]);
                return (
                    <div key={currentPath} className="folder">
                        <span onClick={() => toggleFolder(currentPath)} className={openFolders[currentPath] ? 'open' : 'closed'}>
                            {key}
                        </span>
                        <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={(e) => {
                                // Check/uncheck all children when parent checkbox is toggled
                                const newCheckedState = !isChecked;
                                Object.keys(value).forEach(childKey => {
                                    handleCheckboxChange(`${currentPath}${childKey}`, newCheckedState);
                                });
                            }} 
                        />
                        {openFolders[currentPath] && (
                            <div style={{ paddingLeft: '20px' }}>
                                {renderTree(value, currentPath)}
                            </div>
                        )}
                    </div>
                );
            } else {
                return (
                    <div key={value} className="file-item">
                        <input 
                            type="checkbox" 
                            id={value} 
                            value={value} 
                            checked={checkedItems[value] || false} 
                            onChange={(e) => handleCheckboxChange(value, e.target.checked)} 
                            className="custom-checkbox" 
                        />
                        <label htmlFor={value}>{key}</label>
                    </div>
                );
            }
        });
    };

    return <div className="directory-tree">{renderTree(data)}</div>;
};

export default DirectoryTree;
