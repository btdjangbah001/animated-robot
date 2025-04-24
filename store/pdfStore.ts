import {create} from "zustand";

type PdfState = {
    isPdfModalOpen: boolean;
    setIsPdfModalOpen: (state: boolean) => void;
 }

export const usePdfModalStore = create<PdfState>((set) => ({
    isPdfModalOpen: false,
    setIsPdfModalOpen: (state: boolean) => set({ isPdfModalOpen: state }),
}));
