import { create } from 'zustand';

type Contact = any;

type ContactsState = {
  selectedContact: Contact | null;
  checkedItems: Contact[];
  sheetOpen: boolean;
  contactModalOpen: boolean;
  isDeleteOpen: boolean;
  isBulkDeleteOpen: boolean;

  openSheet: (contact: Contact) => void;
  openContactModal: (contact?: Contact) => void;
  openDeleteModal: (contact: Contact) => void;
  closeAllModals: () => void;
  toggleSelect: (contact: Contact, checked: boolean) => void;
  selectAll: (contacts: Contact[]) => void;
  clearSelection: () => void;
  openBulkDelete: () => void;
};

export const useContactsStore = create<ContactsState>((set) => ({
  selectedContact: null,
  checkedItems: [],
  sheetOpen: false,
  contactModalOpen: false,
  isDeleteOpen: false,
  isBulkDeleteOpen: false,

  openSheet: (contact) => set({ selectedContact: contact, sheetOpen: true }),
  openContactModal: (contact = null) => set({ selectedContact: contact, contactModalOpen: true }),
  openDeleteModal: (contact) => set({ selectedContact: contact, isDeleteOpen: true }),
  closeAllModals: () => set({ selectedContact: null, sheetOpen: false, contactModalOpen: false, isDeleteOpen: false, isBulkDeleteOpen: false }),
  toggleSelect: (contact, checked) =>
    set((state) => ({
      checkedItems: checked
        ? [...state.checkedItems, contact]
        : state.checkedItems.filter((c) => c.id !== contact.id),
    })),
  selectAll: (contacts) => set({ checkedItems: contacts }),
  clearSelection: () => set({ checkedItems: [] }),
  openBulkDelete: () => set({ isBulkDeleteOpen: true }),
}));
