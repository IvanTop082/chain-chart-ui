/**
 * Creates a URL path for a given page name
 * @param pageName - The name of the page (e.g., 'Builder', 'Contracts')
 * @returns The URL path (e.g., '/builder', '/contracts')
 */
export function createPageUrl(pageName: string): string {
  // Convert page name to lowercase and return the path
  const pageMap: Record<string, string> = {
    'Builder': '/builder',
    'Contracts': '/contracts',
    'Deploy': '/deploy',
    'Home': '/home',
  };

  return pageMap[pageName] || `/${pageName.toLowerCase()}`;
}


