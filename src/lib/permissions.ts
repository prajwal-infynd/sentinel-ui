export const ROLE_PAGES = [
  "Onboarding",
  "Dashboard/Monitoring",
  "Investigations",
  "Alerts",
  "AI Agents",
  "Policy",
  "Governance",
  "Reporting",
  "Settings",
  "Admin",
  "Data Sources",
  "Media",
  "Crawl Engine",
] as const;

export type PagePermission = {
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type PagePermissions = Record<string, PagePermission>;

/** Build a full page permissions object with all permissions set to `value` */
export function allPagePermissions(value: boolean): PagePermissions {
  const perms: PagePermissions = {};
  for (const page of ROLE_PAGES) {
    perms[page] = { create: value, edit: value, delete: value };
  }
  return perms;
}

/** Flatten page permissions into permission string array for hasPermission() */
export function flattenPagePermissions(pagePerms: PagePermissions): string[] {
  const result: string[] = [];
  for (const [page, actions] of Object.entries(pagePerms)) {
    if (actions.create) result.push(`page:${page}:create`);
    if (actions.edit) result.push(`page:${page}:edit`);
    if (actions.delete) result.push(`page:${page}:delete`);
  }
  return result;
}
