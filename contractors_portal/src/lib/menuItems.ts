import { LayoutGrid, DollarSign, MessageSquareMore, ShoppingCart, File, MessageSquare, User } from 'lucide-react';

export const menuItems = [
  {
    icon: LayoutGrid,
    label: 'Dashboard',
    href: '/dashboard',
    basePath: '/dashboard',
  },
  // {
  //   icon: MessageSquareMore,
  //   label: 'Communications',
  //   href: '#',
  //   basePath: '/communications',
  // },
  {
    icon: ShoppingCart,
    label: 'Procurement',
    href: '/procurement',
    basePath: '/procurement',
  },
  {
    icon: MessageSquare,
    label: 'Messages',
    href: '/messages',
    basePath: '/messages',
  },
  // {
  //   icon: DollarSign,
  //   label: 'Finances',
  //   href: '/finance',
  //   basePath: '/finance',
  // },
  {
    icon: File,
    label: 'Files',
    href: '/documents',
    basePath: '/documents',
  },
  {
    icon: User,
    label: 'Profile',
    href: '/profile',
    basePath: '/profile',
  },
];
