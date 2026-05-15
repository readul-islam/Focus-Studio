import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProposalItem {
  id: string;
  title: string;
  client: string;
  value: string;
  status: 'Draft' | 'Sent' | 'Under Review' | 'Accepted' | 'Rejected';
  sentDate: string | null;
  expiryDate: string | null;
  contact: string;
  avatar: string;
  linkedLeadId?: string;
}

export interface ProposalFormData {
  id?: string;
  client?: string;
  contact?: string;
  branding?: string;
  title?: string;
  currency?: string;
  validUntil?: string;
  scope?: string;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  terms?: string;
  message?: string;
  linkedLeadId?: string;
  // API-returned read-only fields
  reference_number?: string;
  access_token?: string;
}

interface ProposalsState {
  // Data
  proposals: ProposalItem[];
  currentProposal: ProposalFormData | null;

  // UI State
  searchTerm: string;
  filterStatus: string;
  drawerOpen: boolean;
  previewOpen: boolean;

  // Lead creation pre-fill data
  leadPreFillData: any | null;

  // Actions
  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: string) => void;
  setDrawerOpen: (open: boolean) => void;
  setPreviewOpen: (open: boolean) => void;

  // Lead creation actions
  setLeadPreFillData: (data: any | null) => void;

  // Proposal actions
  addProposal: (proposal: ProposalItem) => void;
  updateProposal: (id: string, updates: Partial<ProposalItem>) => void;
  deleteProposal: (id: string) => void;

  // Form state management
  setCurrentProposal: (proposal: ProposalFormData | null) => void;
  updateCurrentProposal: (updates: Partial<ProposalFormData>) => void;
  saveCurrentProposal: () => void;
  clearCurrentProposal: () => void;
}

const useProposalsStore = create<ProposalsState>()(
  persist(
    (set, get) => ({
      // Initial state
      proposals: [],
      currentProposal: null,
      searchTerm: '',
      filterStatus: 'all',
      drawerOpen: false,
      previewOpen: false,
      leadPreFillData: null,

      // Search and filter actions
      setSearchTerm: (term) => set({ searchTerm: term }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      setPreviewOpen: (open) => set({ previewOpen: open }),

      // Lead creation actions
      setLeadPreFillData: (data) => set({ leadPreFillData: data }),

      // Proposal CRUD operations
      addProposal: (proposal) =>
        set((state) => ({
          proposals: [...state.proposals, proposal],
        })),

      updateProposal: (id, updates) =>
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteProposal: (id) =>
        set((state) => ({
          proposals: state.proposals.filter((p) => p.id !== id),
        })),

      // Form state management
      setCurrentProposal: (proposal) => set({ currentProposal: proposal }),

      updateCurrentProposal: (updates) =>
        set((state) => ({
          currentProposal: state.currentProposal
            ? { ...state.currentProposal, ...updates }
            : updates,
        })),

      saveCurrentProposal: () => {
        const { currentProposal, proposals } = get();
        if (!currentProposal) return;

        const proposalItem: ProposalItem = {
          id: currentProposal.id || `prop-${Date.now()}`,
          title: currentProposal.title || 'Untitled Proposal',
          client: currentProposal.client || 'Unknown Client',
          value: currentProposal.total ? `£${currentProposal.total.toLocaleString()}` : '£0',
          status: 'Draft',
          sentDate: null,
          expiryDate: currentProposal.validUntil || null,
          contact: currentProposal.contact || '',
          avatar: currentProposal.client ? currentProposal.client.substring(0, 2).toUpperCase() : 'UC',
          linkedLeadId: currentProposal.linkedLeadId,
        };

        if (currentProposal.id) {
          // Update existing proposal
          set((state) => ({
            proposals: state.proposals.map((p) =>
              p.id === currentProposal.id ? proposalItem : p
            ),
          }));
        } else {
          // Add new proposal
          set((state) => ({
            proposals: [...state.proposals, proposalItem],
          }));
        }
      },

      clearCurrentProposal: () => set({ currentProposal: null }),
    }),
    {
      name: 'proposals-store',
      partialize: (state) => ({
        proposals: state.proposals,
        currentProposal: state.currentProposal,
      }),
    }
  )
);

export default useProposalsStore;