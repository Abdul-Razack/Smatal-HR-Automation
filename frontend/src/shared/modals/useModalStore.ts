import { create } from 'zustand';
import { ModalConfig } from '../types';

interface ModalStore {
  modals: Record<string, ModalConfig>;
  openModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
  closeModal: (id: string) => void;
  closeAll: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modals: {},
  openModal: (config) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [config.id]: { ...config, isOpen: true },
      },
    })),
  closeModal: (id) =>
    set((state) => {
      const newModals = { ...state.modals };
      if (newModals[id]) {
        newModals[id].isOpen = false;
      }
      return { modals: newModals };
    }),
  closeAll: () =>
    set((state) => {
      const closed = Object.keys(state.modals).reduce((acc, key) => {
        acc[key] = { ...state.modals[key], isOpen: false };
        return acc;
      }, {} as Record<string, ModalConfig>);
      return { modals: closed };
    }),
}));
