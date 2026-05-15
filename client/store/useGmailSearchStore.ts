import { create } from 'zustand';

type GmailSearchState = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
};

export const useGmailSearchStore = create<GmailSearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: '' }),
}));
