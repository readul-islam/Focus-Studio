import { LayoutGrid, ShoppingCart, MessageSquare, File, User } from 'lucide-react';

export const menuItems = [
  {
    icon: LayoutGrid,
    labelKey: 'dashboard',
    href: '/dashboard',
    basePath: '/dashboard',
  },
  {
    icon: ShoppingCart,
    labelKey: 'procurement',
    href: '/procurement',
    basePath: '/procurement',
  },
  {
    icon: MessageSquare,
    labelKey: 'messages',
    href: '/messages',
    basePath: '/messages',
  },
  {
    icon: File,
    labelKey: 'files',
    href: '/documents',
    basePath: '/documents',
  },
  {
    icon: User,
    labelKey: 'profile',
    href: '/profile',
    basePath: '/profile',
  },
] as const;

export type MenuLabelKey = (typeof menuItems)[number]['labelKey'];
