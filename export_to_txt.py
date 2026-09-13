import os
import shutil
import re

def export_project_to_txt():
    workspace_dir = os.path.dirname(os.path.abspath(__file__))
    structured_dest = os.path.join(workspace_dir, "codebase_txt")
    flat_dest = os.path.join(workspace_dir, "codebase_txt_flat")

    # Recreate clean destination directories
    for path in [structured_dest, flat_dest]:
        if os.path.exists(path):
            # Clean directory contents first, handles read-only files and catches issues gracefully
            for root_dir, subdirs, files in os.walk(path, topdown=False):
                for file in files:
                    file_path = os.path.join(root_dir, file)
                    try:
                        os.chmod(file_path, 0o777)
                        os.remove(file_path)
                    except Exception:
                        pass
                for subdir in subdirs:
                    subdir_path = os.path.join(root_dir, subdir)
                    try:
                        os.chmod(subdir_path, 0o777)
                        os.rmdir(subdir_path)
                    except Exception:
                        pass
            try:
                os.rmdir(path)
            except Exception:
                pass
        os.makedirs(path, exist_ok=True)

    # Directories to ignore
    ignored_dirs = {
        ".git", "node_modules", ".venv", "venv", "dist", 
        "__pycache__", "codebase_txt", "codebase_txt_flat", "txt_copies"
    }

    # Files to ignore
    ignored_files = {
        "package-lock.json", "export_to_txt.py", ".DS_Store"
    }

    # Supported extensions
    allowed_extensions = {
        ".js", ".jsx", ".ts", ".tsx", ".css", ".html", 
        ".json", ".py", ".md", ".env", ".yml", ".yaml", 
        ".ini", ".toml", ".txt"
    }

    copied_count = 0
    print("Starting source code export to .txt...")

    for root, dirs, files in os.walk(workspace_dir):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.')]

        for file in files:
            if file in ignored_files or file.startswith('.'):
                if file != ".env": # Allow .env file
                    continue

            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, workspace_dir)

            # Check extension
            _, ext = os.path.splitext(file)
            if ext.lower() not in allowed_extensions and file != ".env":
                continue

            # Skip very large auto-generated files if any
            if os.path.getsize(file_path) > 1024 * 1024: # 1MB limit
                print(f"Skipping large file: {rel_path}")
                continue

            copied_count += 1

            # 1. Copy preserving structure: codebase_txt/path/to/file.ext.txt
            dest_struct_file = os.path.join(structured_dest, rel_path + ".txt")
            os.makedirs(os.path.dirname(dest_struct_file), exist_ok=True)
            shutil.copy2(file_path, dest_struct_file)

            # 2. Copy flat structure: codebase_txt_flat/path_to_file.ext.txt
            # Replace path separators with underscores for flat names
            flat_name = rel_path.replace(os.sep, "_") + ".txt"
            dest_flat_file = os.path.join(flat_dest, flat_name)
            shutil.copy2(file_path, dest_flat_file)

    print(f"\nSuccessfully copied {copied_count} files to:")
    print(f"  - Structured: {structured_dest}")
    print(f"  - Flat: {flat_dest}")

if __name__ == "__main__":
    export_project_to_txt()
