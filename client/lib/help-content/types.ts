export interface HelpArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: number; // minutes
  content: string; // markdown-style content
  screenshots?: string[]; // paths to /public/help-screenshots/
  lastUpdated: string;
  related?: string[]; // slugs of related articles
}

export interface HelpCategory {
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'Set up your studio, invite your team, create your first project',
    icon: 'Rocket',
  },
  {
    slug: 'home-dashboard',
    name: 'Home & Dashboard',
    description: 'Dashboard, inbox, tasks, calendar, and time tracking',
    icon: 'Home',
  },
  {
    slug: 'projects',
    name: 'Projects',
    description: 'Manage tasks, docs, finance, procurement, and contractors',
    icon: 'Folder',
  },
  {
    slug: 'crm',
    name: 'CRM',
    description: 'Contacts, leads, pipeline, and proposals',
    icon: 'Users',
  },
  {
    slug: 'finance',
    name: 'Finance',
    description: 'Invoices, purchase orders, and financial tracking',
    icon: 'DollarSign',
  },
  {
    slug: 'library',
    name: 'Library',
    description: 'Products, materials, and your design library',
    icon: 'BookOpen',
  },
  {
    slug: 'ai-tools',
    name: 'AI Tools',
    description: 'AI Clipper, daily brief, and AI-powered features',
    icon: 'Sparkles',
  },
  {
    slug: 'team',
    name: 'Team',
    description: 'Invite members, manage roles and permissions',
    icon: 'Users2',
  },
  {
    slug: 'reports',
    name: 'Reports',
    description: 'Cost, productivity, profitability, and utilisation reports',
    icon: 'BarChart',
  },
  {
    slug: 'settings',
    name: 'Settings',
    description: 'Studio setup, branding, integrations, and preferences',
    icon: 'Settings',
  },
];
