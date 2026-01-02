import { create } from 'zustand';

interface UIStore {
    isSideMenuOpen: boolean;
    openSideMenu: () => void;
    closeSideMenu: () => void;
    toggleSideMenu: () => void;
    isLeGeZtAdminSidebarCollapsed: boolean;
    toggleLeGeZtAdminSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    isSideMenuOpen: false,
    openSideMenu: () => set({ isSideMenuOpen: true }),
    closeSideMenu: () => set({ isSideMenuOpen: false }),
    toggleSideMenu: () => set((state) => ({ isSideMenuOpen: !state.isSideMenuOpen })),
    isLeGeZtAdminSidebarCollapsed: false,
    toggleLeGeZtAdminSidebar: () => set((state) => ({ isLeGeZtAdminSidebarCollapsed: !state.isLeGeZtAdminSidebarCollapsed })),
}));
