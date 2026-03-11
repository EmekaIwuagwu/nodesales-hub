import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ProjectFile } from '../../types';
import { FileService } from '../../services/FileService';

interface EditorState {
    files: ProjectFile[];
    activeFileId: string | null;
    sidebarActiveTab: string;
    projectPath: string | null;
    projectLanguage: 'solidity' | 'quorlin' | null;
    isProjectLoading: boolean;
    undoStack: { id: string; content: string }[];
}

const initialState: EditorState = {
    files: [],
    activeFileId: null,
    sidebarActiveTab: 'files',
    projectPath: null,
    projectLanguage: null,
    isProjectLoading: false,
    undoStack: [],
};

// Helper for recursive file scanning
async function scanDirectory(path: string, service: FileService): Promise<ProjectFile[]> {
    const fileNames = await service.listDirectory(path);
    let results: ProjectFile[] = [];

    for (const name of fileNames) {
        const fullPath = `${path}/${name}`;
        const isDir = await service.isDirectory(fullPath);

        if (isDir) {
            const children = await scanDirectory(fullPath, service);
            results = [...results, ...children];
        } else if (name.endsWith('.sol') || name.endsWith('.ql')) {
            const content = await service.readFile(fullPath);
            results.push({
                id: fullPath,
                name: name,
                content: content,
                language: (name.endsWith('.sol') ? 'solidity' : 'quorlin') as any,
                isOpen: false,
                isDirty: false,
                path: fullPath
            });
        }
    }
    return results;
}

export const openProject = createAsyncThunk(
    'editor/openProject',
    async (manualPath: string | undefined, { rejectWithValue }) => {
        try {
            const service = FileService.getInstance();
            const path = manualPath || await service.selectFolder();
            if (!path) return null;

            const files = await scanDirectory(path, service);
            return { path, files };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const createNewProject = createAsyncThunk(
    'editor/createNewProject',
    async ({ projectName, language }: { projectName: string, language: 'solidity' | 'quorlin' }, { rejectWithValue }) => {
        try {
            const service = FileService.getInstance();
            // selectFolder() returns the address-scoped virtual root in web mode
            // or lets the user pick a folder in Electron mode
            const rootPath = await service.selectFolder();
            if (!rootPath) return null;

            const projectPath = `${rootPath}/${projectName}`;
            await service.createFolder(projectPath);
            await service.createFolder(`${projectPath}/contracts`);

            // Save this as the last project for this address
            service.setLastProject(projectPath);

            // Start with an EMPTY contracts folder — user creates files via right-click
            return { path: projectPath, files: [], language };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * Called immediately after wallet connects.
 * Sets the address in FileService, then loads the last project for that address.
 * This restores the full workspace from the previous session.
 */
export const loadWorkspace = createAsyncThunk(
    'editor/loadWorkspace',
    async (address: string, { rejectWithValue }) => {
        try {
            const service = FileService.getInstance();
            const lastPath = service.setAddress(address); // loads address storage
            if (!lastPath) return null; // first-time user: no workspace yet

            const exists = await service.isDirectory(lastPath);
            if (!exists) return null;

            const files = await scanDirectory(lastPath, service);
            return { path: lastPath, files };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const saveActiveFile = createAsyncThunk(
    'editor/saveFile',
    async (_, { getState, rejectWithValue }) => {
        const state = (getState() as any).editor as EditorState;
        const activeFile = state.files.find(f => f.id === state.activeFileId);

        if (!activeFile || !activeFile.path) {
            return rejectWithValue('No file to save');
        }

        try {
            const service = FileService.getInstance();
            await service.writeFile(activeFile.path, activeFile.content);
            return activeFile.id;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const createNewFile = createAsyncThunk(
    'editor/createNewFile',
    async ({ name, content, targetFolder }: { name: string, content: string, targetFolder?: string }, { getState, rejectWithValue }) => {
        const state = (getState() as any).editor as EditorState;
        if (!state.projectPath) return rejectWithValue('No project open');

        const folderPath = targetFolder || `${state.projectPath}/contracts`;
        const filePath = `${folderPath}/${name}`;
        try {
            const service = FileService.getInstance();
            await service.writeFile(filePath, content);
            return {
                id: filePath,
                name: name.split('/').pop()!,
                content,
                language: (name.endsWith('.sol') ? 'solidity' : 'quorlin') as any,
                isOpen: true,
                isDirty: false,
                path: filePath
            };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const deleteFile = createAsyncThunk(
    'editor/deleteFile',
    async (fileId: string, { rejectWithValue }) => {
        try {
            const service = FileService.getInstance();
            await service.deleteFile(fileId);
            return fileId;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const renameFile = createAsyncThunk(
    'editor/renameFile',
    async ({ fileId, newName, targetFolder }: { fileId: string; newName: string; targetFolder?: string }, { getState, rejectWithValue }) => {
        const state = (getState() as any).editor as EditorState;
        const file = state.files.find(f => f.id === fileId);
        if (!file) return rejectWithValue('File not found');

        const dirPath = targetFolder || file.path!.split('/').slice(0, -1).join('/');
        const newPath = `${dirPath}/${newName}`;

        try {
            const service = FileService.getInstance();
            await service.renameFile(file.path!, newPath);
            return { oldId: fileId, newId: newPath, newName, newPath };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const loadLastProject = createAsyncThunk(
    'editor/loadLastProject',
    async (_) => {
        const lastPath = localStorage.getItem('kortana_ide_last_project');
        if (lastPath) {
            const service = FileService.getInstance();
            const exists = await service.isDirectory(lastPath);
            if (exists) {
                const files = await scanDirectory(lastPath, service);
                return { path: lastPath, files };
            }
        }
        return null;
    }
);

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setActiveFile(state, action: PayloadAction<string | null>) {
            state.activeFileId = action.payload;
            if (action.payload) {
                const file = state.files.find(f => f.id === action.payload);
                if (file) {
                    file.isOpen = true;
                }
            }
        },
        updateFileContent(state, action: PayloadAction<{ id: string, content: string }>) {
            const file = state.files.find(f => f.id === action.payload.id);
            if (file) {
                // Push to undo stack before changing
                state.undoStack.push({ id: file.id, content: file.content });
                if (state.undoStack.length > 50) state.undoStack.shift(); // cap
                file.content = action.payload.content;
                file.isDirty = true;
            }
        },
        undoLastChange(state) {
            const last = state.undoStack.pop();
            if (last) {
                const file = state.files.find(f => f.id === last.id);
                if (file) {
                    file.content = last.content;
                    file.isDirty = true;
                }
            }
        },
        setSidebarTab(state, action: PayloadAction<string>) {
            state.sidebarActiveTab = action.payload;
        },
        closeFile(state, action: PayloadAction<string>) {
            const file = state.files.find(f => f.id === action.payload);
            if (file) {
                file.isOpen = false;
                if (state.activeFileId === action.payload) {
                    const remainingOpen = state.files.filter(f => f.isOpen);
                    state.activeFileId = remainingOpen.length > 0 ? remainingOpen[0].id : null;
                }
            }
        },
        clearWorkspace(state) {
            state.files = [];
            state.activeFileId = null;
            state.projectPath = null;
            state.projectLanguage = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(openProject.pending, (state) => {
            state.isProjectLoading = true;
        });
        builder.addCase(openProject.fulfilled, (state, action) => {
            state.isProjectLoading = false;
            if (action.payload) {
                state.projectPath = action.payload.path;
                state.files = action.payload.files;
                state.activeFileId = null;
                localStorage.setItem('kortana_ide_last_project', action.payload.path);
                const hasSol = action.payload.files.some(f => f.name.endsWith('.sol'));
                const hasQrl = action.payload.files.some(f => f.name.endsWith('.ql'));
                state.projectLanguage = hasSol ? 'solidity' : (hasQrl ? 'quorlin' : null);
            }
        });
        builder.addCase(createNewProject.fulfilled, (state, action) => {
            if (action.payload) {
                state.projectPath = action.payload.path;
                state.files = [];  // ✅ Always empty on new project
                state.projectLanguage = action.payload.language;
                state.activeFileId = null;
                localStorage.setItem('kortana_ide_last_project', action.payload.path);
            }
        });
        builder.addCase(createNewFile.fulfilled, (state, action) => {
            if (action.payload) {
                state.files.push(action.payload as any);
                state.activeFileId = action.payload.id;
            }
        });
        builder.addCase(saveActiveFile.fulfilled, (state, action) => {
            const file = state.files.find(f => f.id === action.payload);
            if (file) {
                file.isDirty = false;
            }
        });
        builder.addCase(deleteFile.fulfilled, (state, action) => {
            state.files = state.files.filter(f => f.id !== action.payload);
            if (state.activeFileId === action.payload) {
                const remainingOpen = state.files.filter(f => f.isOpen);
                state.activeFileId = remainingOpen.length > 0 ? remainingOpen[0].id : null;
            }
        });
        builder.addCase(renameFile.fulfilled, (state, action) => {
            if (action.payload) {
                const { oldId, newId, newName, newPath } = action.payload;
                const file = state.files.find(f => f.id === oldId);
                if (file) {
                    file.id = newId;
                    file.name = newName;
                    file.path = newPath;
                    file.language = newName.endsWith('.sol') ? 'solidity' : 'quorlin';
                    if (state.activeFileId === oldId) state.activeFileId = newId;
                }
            }
        });
        builder.addCase(loadLastProject.fulfilled, (state, action) => {
            if (action.payload) {
                state.projectPath = action.payload.path;
                state.files = action.payload.files;
                const hasSol = action.payload.files.some(f => f.name.endsWith('.sol'));
                const hasQrl = action.payload.files.some(f => f.name.endsWith('.ql'));
                state.projectLanguage = hasSol ? 'solidity' : (hasQrl ? 'quorlin' : null);
            }
        });
        builder.addCase(loadWorkspace.fulfilled, (state, action) => {
            if (action.payload) {
                state.projectPath = action.payload.path;
                state.files = action.payload.files;
                const hasSol = action.payload.files.some(f => f.name.endsWith('.sol'));
                const hasQrl = action.payload.files.some(f => f.name.endsWith('.ql'));
                state.projectLanguage = hasSol ? 'solidity' : (hasQrl ? 'quorlin' : null);
                // Re-open the first file if any files exist
                if (action.payload.files.length > 0) {
                    const firstFile = action.payload.files[0];
                    state.activeFileId = firstFile.id;
                    firstFile.isOpen = true;
                }
            } else {
                // New user - clean slate
                state.projectPath = null;
                state.files = [];
                state.projectLanguage = null;
                state.activeFileId = null;
            }
        });
    }
});

export const { setActiveFile, updateFileContent, setSidebarTab, closeFile, clearWorkspace, undoLastChange } = editorSlice.actions;
export default editorSlice.reducer;
