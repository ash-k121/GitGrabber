import React, { useState } from 'react';
import axios from 'axios';
import DirectoryTree from './DirectoryTree';
import './styles.css';

const FileDownloader = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [branch, setBranch] = useState('main');
    const [fileList, setFileList] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [destinationFolder, setDestinationFolder] = useState('');

    const handleRepoUrlChange = (e) => {
        setRepoUrl(e.target.value);
    };

    const handleBranchChange = (e) => {
        setBranch(e.target.value);
    };

    const handleDestinationChange = (e) => {
        setDestinationFolder(e.target.value);
    };

    const handleFileSelect = (e) => {
        const value = e.target.value;
        setSelectedFiles((prev) =>
            prev.includes(value) ? prev.filter((file) => file !== value) : [...prev, value]
        );
    };

    const fetchFileList = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/fetch-files', {
                repo_url: repoUrl,
                branch: branch,
            });
            setFileList(response.data);
        } catch (error) {
            console.error("Error fetching file list:", error);
        }
    };

    // Function to open the directory picker
    const openDirectoryPicker = async () => {
        try {
            const directoryHandle = await window.showDirectoryPicker();
            // Use the directoryHandle to get the name and path
            setDestinationFolder(directoryHandle.name); // Display just the folder name
            console.log(directoryHandle); // Log the entire handle for debugging

            // If you want to keep track of the full path, you might need to store it differently
            // Since `directoryHandle` does not expose a full path for security reasons
        } catch (error) {
            console.error("Error picking directory:", error);
        }
    };

    const handleSubmitDownload = async (event) => {
        event.preventDefault();

        try {
            await axios.post('http://127.0.0.1:5000/api/download', {
                selected_files: selectedFiles,
                destination_folder: destinationFolder, // This should be handled properly in your backend
                repo_owner: repoUrl.split('/')[3],
                repo_name: repoUrl.split('/')[4].replace('.git', ''),
                branch: branch,
            });
            alert("Files downloaded successfully!");
        } catch (error) {
            console.error("Error downloading files:", error);
            alert("Error downloading files.");
        }
    };

    return (
        <div className="FileDownloader">
            <h1>GitHub File Downloader</h1>
            <form onSubmit={handleSubmitDownload}>
                <div>
                    <label>Repository URL </label>
                    <input type="text" value={repoUrl} onChange={handleRepoUrlChange} required />
                </div>
                <div>
                    <label>Branch </label>
                    <input type="text" value={branch} onChange={handleBranchChange} />
                </div>
                <div>
                    <label>Destination Folder </label>
                    <input type="text" value={destinationFolder} readOnly />
                    <button type="button" onClick={openDirectoryPicker}>Select Folder</button>
                </div>
                <button type="button" onClick={fetchFileList}>Fetch File List</button>

                {/* Render the Directory Tree */}
                {Object.keys(fileList).length > 0 && (
                    <DirectoryTree data={fileList} onFileSelect={handleFileSelect} />
                )}

                <button type="submit">Download Selected Files</button>
            </form>
        </div>
    );
};

export default FileDownloader;
