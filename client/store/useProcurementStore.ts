import { create } from 'zustand';

type ProcurementItem = any;

type ProcurementState = {
  // Selection state
  checkedItems: ProcurementItem[];

  // Search state
  searchInput: string;

  // UI state
  showTip: boolean;
  visible: boolean;
  filterOpen: boolean;
  roomOpen: boolean;
  supplierOpen: boolean;
  isBulkDeleteOpen: boolean;

  // Filter state
  needsActionActive: boolean;
  roomFilter: string;
  supplierFilter: string;
  approvalFilter: string;
  poStatusFilter: string;
  billingFilter: string;
  sampleFilter: string;
  logisticsFilter: string;
  dateFilter: string;

  // Loading state
  buttonLoadingPO: boolean;
  buttonLoadingInvoice: boolean;
  buttonLoadingDelete: boolean;

  // Product detail state
  open: boolean;
  selected: any;
  isDeleteHovered: boolean;

  // Actions
  setCheckedItems: (items: ProcurementItem[] | ((prev: ProcurementItem[]) => ProcurementItem[])) => void;
  setSearchInput: (value: string) => void;
  setShowTip: (show: boolean) => void;
  setVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  setFilterOpen: (open: boolean) => void;
  setRoomOpen: (open: boolean) => void;
  setSupplierOpen: (open: boolean) => void;
  setIsBulkDeleteOpen: (open: boolean) => void;

  setNeedsActionActive: (active: boolean) => void;
  setRoomFilter: (filter: string) => void;
  setSupplierFilter: (filter: string) => void;
  setApprovalFilter: (filter: string) => void;
  setPOStatusFilter: (filter: string) => void;
  setBillingFilter: (filter: string) => void;
  setSampleFilter: (filter: string) => void;
  setLogisticsFilter: (filter: string) => void;
  setDateFilter: (filter: string) => void;

  setButtonLoadingPO: (loading: boolean) => void;
  setButtonLoadingInvoice: (loading: boolean) => void;
  setButtonLoadingDelete: (loading: boolean) => void;

  setOpen: (open: boolean) => void;
  setSelected: (product: any) => void;
  setIsDeleteHovered: (hovered: boolean) => void;

  resetFilters: () => void;
  loadFilters: (projectId: string) => void;
  saveFilters: (projectId: string) => void;
};

export const useProcurementStore = create<ProcurementState>((set, get) => ({
  // Initial state
  checkedItems: [],
  searchInput: '',
  showTip: true,
  visible: false,
  filterOpen: false,
  roomOpen: false,
  supplierOpen: false,
  isBulkDeleteOpen: false,
  needsActionActive: false,
  roomFilter: 'all',
  supplierFilter: 'all',
  approvalFilter: 'all',
  poStatusFilter: 'all',
  billingFilter: 'all',
  sampleFilter: 'all',
  logisticsFilter: 'all',
  dateFilter: 'all',
  buttonLoadingPO: false,
  buttonLoadingInvoice: false,
  buttonLoadingDelete: false,
  open: false,
  selected: undefined,
  isDeleteHovered: false,

  // Actions
  setCheckedItems: (items) =>
    set((state) => ({
      checkedItems: typeof items === 'function' ? items(state.checkedItems) : items,
    })),

  setSearchInput: (value) => set({ searchInput: value }),
  setShowTip: (show) => set({ showTip: show }),
  setVisible: (visible) =>
    set((state) => ({
      visible: typeof visible === 'function' ? visible(state.visible) : visible,
    })),
  setFilterOpen: (open) => set({ filterOpen: open }),
  setRoomOpen: (open) => set({ roomOpen: open }),
  setSupplierOpen: (open) => set({ supplierOpen: open }),
  setIsBulkDeleteOpen: (open) => set({ isBulkDeleteOpen: open }),

  setNeedsActionActive: (active) => set({ needsActionActive: active }),
  setRoomFilter: (filter) => set({ roomFilter: filter }),
  setSupplierFilter: (filter) => set({ supplierFilter: filter }),
  setApprovalFilter: (filter) => set({ approvalFilter: filter }),
  setPOStatusFilter: (filter) => set({ poStatusFilter: filter }),
  setBillingFilter: (filter) => set({ billingFilter: filter }),
  setSampleFilter: (filter) => set({ sampleFilter: filter }),
  setLogisticsFilter: (filter) => set({ logisticsFilter: filter }),
  setDateFilter: (filter) => set({ dateFilter: filter }),

  setButtonLoadingPO: (loading) => set({ buttonLoadingPO: loading }),
  setButtonLoadingInvoice: (loading) => set({ buttonLoadingInvoice: loading }),
  setButtonLoadingDelete: (loading) => set({ buttonLoadingDelete: loading }),

  setOpen: (open) => set({ open }),
  setSelected: (product) => set({ selected: product }),
  setIsDeleteHovered: (hovered) => set({ isDeleteHovered: hovered }),

  resetFilters: () =>
    set({
      roomFilter: 'all',
      supplierFilter: 'all',
      approvalFilter: 'all',
      poStatusFilter: 'all',
      billingFilter: 'all',
      sampleFilter: 'all',
      logisticsFilter: 'all',
      dateFilter: 'all',
    }),

  loadFilters: (projectId) => {
    const stored = localStorage.getItem(`procurement-filters-${projectId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      set({
        needsActionActive: parsed.needsAction || false,
        roomFilter: parsed.room || 'all',
        supplierFilter: parsed.supplier || 'all',
        approvalFilter: parsed.approval || 'all',
        poStatusFilter: parsed.poStatus || 'all',
        billingFilter: parsed.billing || 'all',
        sampleFilter: parsed.sample || 'all',
        logisticsFilter: parsed.logistics || 'all',
        dateFilter: parsed.date || 'all',
      });
    }
  },

  saveFilters: (projectId) => {
    const state = get();
    const filters = {
      needsAction: state.needsActionActive,
      room: state.roomFilter,
      supplier: state.supplierFilter,
      approval: state.approvalFilter,
      poStatus: state.poStatusFilter,
      billing: state.billingFilter,
      sample: state.sampleFilter,
      logistics: state.logisticsFilter,
      date: state.dateFilter,
    };
    localStorage.setItem(`procurement-filters-${projectId}`, JSON.stringify(filters));
  },
}));
