import {
  LayoutGrid,
  DollarSign,
  MessageSquareMore,
  ShoppingCart,
  File,
} from 'lucide-react';

export const menuItems = [
  {
    icon: LayoutGrid,
    label: 'Dashboard',
    href: '/dashboard',
    basePath: '/dashboard',
  },
  {
    icon: MessageSquareMore,
    label: 'Messages',
    href: '#',
    basePath: '/communications',
  },
  {
    icon: ShoppingCart,
    label: 'Procurement',
    href: '/procurement',
    basePath: '/procurement',
  },
  {
    icon: DollarSign,
    label: 'Finances',
    href: '/finance',
    basePath: '/finance',
  },
  {
    icon: File,
    label: 'Documents',
    href: '/documents',
    basePath: '/documents',
  },
];
