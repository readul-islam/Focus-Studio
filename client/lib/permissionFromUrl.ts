const editRules: [RegExp, string][] = [
  [/finance\/|purchase-order|invoices?\/|create-po|create-invoice/, 'finance.edit'],
  [/procurements?\//, 'procurement.edit'],
  [/tasks?\/|subtasks?\//, 'tasks.edit'],
  [/crm\/|clients?\//, 'clients.edit'],
  [/library\/|products?\//, 'library.edit'],
  [/documents?\/|folders?\/|links?\//, 'documents.edit'],
  [/user\/studio\/|user\/invite|user\/self\/update/, 'settings.edit'],
  [/team|members?\//, 'team.edit'],
  [/projects?\//, 'projects.edit'],
];

const viewRules: [RegExp, string][] = [
  [/finance\/|purchase-order|invoices?\/|studio-finance/, 'finance.view'],
  [/procurements?\/|project-procurements/, 'procurement.view'],
  [/tasks?\/|subtasks?\/|project-phases/, 'tasks.view'],
  [/crm\/|clients?\/|studio-contacts/, 'clients.view'],
  [/library\/|products?\//, 'library.view'],
  [/documents?\/|folders?\/|links?\//, 'documents.view'],
  [/reports\//, 'reports.view'],
  [/contractor_portal\/|contractor-portal\//, 'procurement.view'],
  [/projects\//, 'projects.view'],
];

export function permissionFromUrl(url: string): string | null {
  for (const [pattern, permission] of editRules) {
    if (pattern.test(url)) return permission;
  }
  return null;
}

export function viewPermissionFromUrl(url: string): string | null {
  for (const [pattern, permission] of viewRules) {
    if (pattern.test(url)) return permission;
  }
  return null;
}
