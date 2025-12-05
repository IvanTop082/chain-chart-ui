/**
 * Local storage utility for managing projects/contracts
 */

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  created_date: string;
  updated_date: string;
  nodes?: any[];
  edges?: any[];
}

const STORAGE_KEY = 'chainchart_projects';

/**
 * Get all projects from local storage
 */
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load projects from storage:', error);
    return [];
  }
}

/**
 * Save a project to local storage
 */
export function saveProject(project: Project): void {
  if (typeof window === 'undefined') return;
  
  try {
    const projects = getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, updated_date: new Date().toISOString() };
    } else {
      projects.push({
        ...project,
        created_date: project.created_date || new Date().toISOString(),
        updated_date: new Date().toISOString()
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save project to storage:', error);
  }
}

/**
 * Delete a project from local storage
 */
export function deleteProject(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete project from storage:', error);
  }
}

/**
 * Get a single project by ID
 */
export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

/**
 * Create a new project
 */
export function createProject(name: string, description?: string): Project {
  const project: Project = {
    id: `project_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name,
    description,
    status: 'draft',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    nodes: [],
    edges: []
  };
  
  saveProject(project);
  return project;
}

