import create from 'zustand'
import { createProjectSlice, ProjecttSlice } from '@/lib/createProductSlice'

type StoreState = ProjecttSlice 

export const useAppStore = create<StoreState>()((...a) => ({
    ...createProjectSlice(...a),
}))