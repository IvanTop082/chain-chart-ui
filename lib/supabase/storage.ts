/**
 * Supabase storage utility for managing projects/contracts
 */

import { createClient } from './client';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  nodes?: any[];
  edges?: any[];
}

const supabase = createClient();

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<Project[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to load projects:', error);
    return [];
  }

  return data || [];
}

/**
 * Save a project to Supabase
 */
export async function saveProject(project: Partial<Project>): Promise<Project | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to save projects');
  }

  const projectData = {
    ...project,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (project.id) {
    // Update existing project
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', project.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update project:', error);
      throw error;
    }

    return data;
  } else {
    // Create new project
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create project:', error);
      throw error;
    }

    return data;
  }
}

/**
 * Contract storage functions
 */

export interface Contract {
  id: string;
  user_id: string;
  project_id?: string;
  contract_name: string;
  contract_code: string;
  nef_data?: string;  // Base64 encoded
  manifest_data?: Record<string, any>;
  contract_hash?: string;
  tx_hash?: string;
  status: 'generated' | 'compiled' | 'deployed' | 'failed';
  compile_errors?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Save a contract to Supabase
 */
export async function saveContract(contract: Partial<Contract>): Promise<Contract | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to save contracts');
  }

  const contractData = {
    ...contract,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (contract.id) {
    // Update existing contract
    const { data, error } = await supabase
      .from('contracts')
      .update(contractData)
      .eq('id', contract.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update contract:', error);
      throw error;
    }

    return data;
  } else {
    // Create new contract
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        ...contractData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create contract:', error);
      throw error;
    }

    return data;
  }
}

/**
 * Get the latest contract for the current user (optionally filtered by project)
 */
export async function getLatestContract(projectId?: string): Promise<Contract | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('Failed to load contract:', error);
    return null;
  }

  return data;
}

/**
 * Get a contract by ID
 */
export async function getContract(id: string): Promise<Contract | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Failed to load contract:', error);
    return null;
  }

  return data;
}

/**
 * Update contract deployment information
 */
export async function updateContractDeployment(
  contractId: string,
  contractHash?: string,
  txHash?: string,
  status: 'generated' | 'compiled' | 'deployed' | 'failed' = 'deployed'
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to update contracts');
  }

  const updateData: Partial<Contract> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (contractHash) updateData.contract_hash = contractHash;
  if (txHash) updateData.tx_hash = txHash;

  const { error } = await supabase
    .from('contracts')
    .update(updateData)
    .eq('id', contractId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to update contract deployment:', error);
    return false;
  }

  return true;
}

/**
 * Get all contracts for the current user
 */
export async function getContracts(projectId?: string): Promise<Contract[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to load contracts:', error);
    return [];
  }

  return data || [];
}
/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to delete projects');
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Failed to load project:', error);
    return null;
  }

  return data;
}

/**
 * Create a new project
 */
export async function createProject(name: string, description?: string): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to create projects');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      description,
      status: 'draft',
      nodes: [],
      edges: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create project:', error);
    throw error;
  }

  return data;
}


