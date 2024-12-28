from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define a list of disallowed file extensions
DISALLOWED_EXTENSIONS = {'.exe', '.dll', '.sys', '.bat', '.cmd', '.msi'}

def fetch_directory_structure(owner, repo, branch='main'):
    api_url = f'https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1'
    response = requests.get(api_url)
    if response.status_code == 200:
        tree_data = response.json()
        directories = {}
        for item in tree_data['tree']:
            if item['type'] == 'blob':  # Only include files (not directories)
                path_parts = item['path'].split('/')
                current_level = directories
                for part in path_parts[:-1]:  # Exclude the file name
                    if part not in current_level:
                        current_level[part] = {}
                    current_level = current_level[part]
                current_level[path_parts[-1]] = item['path']  # Add file path at the leaf node
        return directories
    else:
        return None

@app.route('/api/fetch-files', methods=['POST'])
def fetch_files():
    repo_url = request.json['repo_url']
    branch = request.json.get('branch', 'main')
    parts = repo_url.split('/')
    owner = parts[-2]
    repo = parts[-1].replace('.git', '')

    directories = fetch_directory_structure(owner, repo, branch)
    if directories is not None:
        return jsonify(directories)
    else:
        return jsonify({'error': 'Failed to fetch repository contents'}), 400

@app.route('/api/download', methods=['POST'])
def download_files():
    data = request.json
    selected_files = data['selected_files']
    destination_folder = data['destination_folder']

    # Ensure the destination folder exists
    try:
        if not os.path.exists(destination_folder):
            os.makedirs(destination_folder)
    except Exception as e:
        return jsonify({"error": f"Failed to create destination folder: {str(e)}"}), 500

    for file_path in selected_files:
        # Check the file extension against the disallowed list
        _, ext = os.path.splitext(file_path)
        if ext in DISALLOWED_EXTENSIONS:
            return jsonify({"error": f"Downloading {file_path} is not allowed."}), 403
        
        # Construct the raw URL to download the file directly from GitHub
        file_url = f'https://raw.githubusercontent.com/{data["repo_owner"]}/{data["repo_name"]}/{data["branch"]}/{file_path}'
        
        try:
            response = requests.get(file_url)
            if response.status_code == 200:
                # Save the file to the specified destination folder
                save_path = os.path.join(destination_folder, os.path.basename(file_path))
                with open(save_path, 'wb') as f:
                    f.write(response.content)
            else:
                return jsonify({"error": f"Failed to download {file_path}"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"status": "Files downloaded successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
