import { StateCreator } from "zustand";

export interface Project {
    id: number;
    name: string;
}

export interface ProjecttSlice {
    projects: Project;
    setProject: (id: number, name: string) => void;
}

export const createProjectSlice: StateCreator<ProjecttSlice> = (set) => ({
    projects: {id: 0, name: ''},
    setProject: async (id: number, name: string) => {
        set({ projects: {id: id, name: name} })
    },
})