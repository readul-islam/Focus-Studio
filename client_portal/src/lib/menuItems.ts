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
    labelKey: 'dashboard',
    href: '/dashboard',
    basePath: '/dashboard',
  },
  {
    icon: MessageSquareMore,
    labelKey: 'messages',
    href: '#',
    basePath: '/communications',
  },
  {
    icon: ShoppingCart,
    labelKey: 'procurement',
    href: '/procurement',
    basePath: '/procurement',
  },
  {
    icon: DollarSign,
    labelKey: 'finances',
    href: '/finance',
    basePath: '/finance',
  },
  {
    icon: File,
    labelKey: 'documents',
    href: '/documents',
    basePath: '/documents',
  },
] as const;
