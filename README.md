# GitGrabber

## Introduction
Welcome to **GitGrabber**! This Chrome extension is designed to help you easily download specific files from GitHub repositories directly to your local destination folder. Instead of downloading entire repositories, GitGrabber allows you to select only the files you need, saving time and bandwidth.

### Key Features
- **Selective File Download**: Choose specific files from a repository to download.
- **User-Friendly Interface**: Simple and intuitive design for easy navigation.
- **Supports Multiple Repositories**: Work with any public GitHub repository.
- **Tech Stack**: Built using React for the frontend, Vite for fast builds, and Flask for the backend.

- **API Endpoints**: 
  - `GET /api/download`: Initiates file download from a specified repository.
  - `GET /api/repositories`: Fetches available repositories for selection.

- **Important Functions**:
  - `downloadFile(fileUrl)`: Handles downloading of selected files from GitHub.
  - `fetchRepositories(userId)`: Retrieves repositories associated with a user.
