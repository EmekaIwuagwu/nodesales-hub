export interface FileSystemEntry {
    name: string;
    path: string;
    isDirectory: boolean;
}

export class FileService {
    private static instance: FileService;
    private isWeb: boolean;
    private mockFiles: Map<string, string> = new Map();
    private mockDirs: Set<string> = new Set();

    private constructor() {
        this.isWeb = typeof window.ipcRenderer === 'undefined';

        if (this.isWeb) {
            this.loadFromStorage();
            // ✅ Migration: clear the old default 'web-project-root' project that was pre-populated.
            // This ensures all existing users start with a bare IDE.
            const lastProject = localStorage.getItem('kortana_ide_last_project');
            if (lastProject === 'web-project-root') {
                this.clearAll();
            }
            // Do NOT pre-populate any default project.
            // The IDE starts completely bare. Files/dirs are only created via user actions.
        }
    }

    private loadFromStorage() {
        try {
            const files = localStorage.getItem('kortana_ide_files');
            const dirs = localStorage.getItem('kortana_ide_dirs');
            if (files) {
                const parsedFiles = JSON.parse(files);
                this.mockFiles = new Map(Object.entries(parsedFiles));
            }
            if (dirs) {
                this.mockDirs = new Set(JSON.parse(dirs));
            }
        } catch (e) {
            console.error('Failed to load from storage', e);
        }
    }

    private persist() {
        if (!this.isWeb) return;
        localStorage.setItem('kortana_ide_files', JSON.stringify(Object.fromEntries(this.mockFiles)));
        localStorage.setItem('kortana_ide_dirs', JSON.stringify(Array.from(this.mockDirs)));
    }

    public static getInstance(): FileService {
        if (!FileService.instance) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }

    /** Returns a virtual root for web mode. Each project is a subfolder of this. */
    public async getWebRoot(): Promise<string> {
        return 'kortana-workspace';
    }

    public async selectFolder(): Promise<string | null> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:selectFolder');
        }
        // In web mode, we use our virtual workspace root
        return 'kortana-workspace';
    }

    public async readFile(path: string): Promise<string> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:readFile', path);
        }
        return this.mockFiles.get(path) || '';
    }

    public async writeFile(path: string, content: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:writeFile', { filePath: path, content });
        }
        this.mockFiles.set(path, content);
        // Recursively ensure all parent dirs exist in mock
        const parts = path.split('/');
        let current = '';
        for (let i = 0; i < parts.length - 1; i++) {
            current = current ? `${current}/${parts[i]}` : parts[i];
            this.mockDirs.add(current);
        }
        this.persist();
        return true;
    }

    public async createFolder(path: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:createFolder', path);
        }
        // Recursively ensure all parent dirs exist
        const parts = path.split('/');
        let current = '';
        for (const part of parts) {
            current = current ? `${current}/${part}` : part;
            this.mockDirs.add(current);
        }
        this.persist();
        return true;
    }

    public async listDirectory(path: string): Promise<string[]> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:getFiles', path);
        }
        // Return only direct children for mock simplification
        const children: string[] = [];
        this.mockFiles.forEach((_, filePath) => {
            if (filePath.startsWith(path + '/') && filePath.split('/').length === path.split('/').length + 1) {
                children.push(filePath.split('/').pop()!);
            }
        });
        this.mockDirs.forEach(dirPath => {
            if (dirPath.startsWith(path + '/') && dirPath.split('/').length === path.split('/').length + 1) {
                children.push(dirPath.split('/').pop()!);
            }
        });
        return [...new Set(children)];
    }

    public async deleteFile(path: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:deleteFile', path);
        }
        this.mockFiles.delete(path);
        this.persist();
        return true;
    }

    public async isDirectory(path: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:isDirectory', path);
        }
        return this.mockDirs.has(path);
    }

    /** Completly wipe all stored data — used for a clean start */
    public clearAll() {
        this.mockFiles.clear();
        this.mockDirs.clear();
        localStorage.removeItem('kortana_ide_files');
        localStorage.removeItem('kortana_ide_dirs');
        localStorage.removeItem('kortana_ide_last_project');
    }

    /** Rename a file in the mock FS */
    public async renameFile(oldPath: string, newPath: string): Promise<boolean> {
        if (!this.isWeb) {
            // Electron would need its own IPC call; skipping for now
            return false;
        }
        const content = this.mockFiles.get(oldPath) || '';
        this.mockFiles.delete(oldPath);
        this.mockFiles.set(newPath, content);
        this.persist();
        return true;
    }
}
