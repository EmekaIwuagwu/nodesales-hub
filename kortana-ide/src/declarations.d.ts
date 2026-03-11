// Ambient declarations for modules that may not have type definitions at build time.
// These allow `tsc` to compile successfully in Docker and CI environments
// where node_modules may differ from local dev.

declare module '@monaco-editor/react' {
    import * as React from 'react';

    export type Monaco = any;
    export type OnMount = (editor: any, monaco: any) => void;
    export type BeforeMount = (monaco: any) => void;

    export interface EditorProps {
        height?: string | number;
        width?: string | number;
        language?: string;
        value?: string;
        defaultValue?: string;
        theme?: string;
        beforeMount?: BeforeMount;
        onMount?: OnMount;
        onChange?: (value: string | undefined) => void;
        options?: Record<string, any>;
        [key: string]: any;
    }

    export const Editor: React.FC<EditorProps>;
    export const loader: any;
    export default Editor;
}

// Shim for @reduxjs/toolkit in case types are not resolved at build time.
declare module '@reduxjs/toolkit' {
    export const createSlice: any;
    export const createAsyncThunk: any;
    export const configureStore: any;
    export const createReducer: any;
    export const createAction: any;
    export type PayloadAction<T = void> = { payload: T; type: string };
    export type ActionReducerMapBuilder<State> = any;
}

