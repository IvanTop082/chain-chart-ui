/**
 * API client for ChainChart backend execution
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DiagramData {
  nodes: any[];
  edges: any[];
}

export interface ExportContractResponse {
  contract: string;
  manifest: Record<string, any>;
  nef: string;
  success: boolean;
  error?: string;
  compile_errors?: string[];
  nef_path?: string;
  manifest_path?: string;
  contract_id?: string;  // Supabase contract ID
}

/**
 * Export Neo smart contract from ChainChart diagram
 * Returns contract code, manifest, and compiled NEF
 */
export async function exportContract(diagram: DiagramData): Promise<ExportContractResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/compile-contract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diagram),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: ExportContractResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to export contract:', error);
    
    // Check if it's a network error (backend not running)
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError' ||
        error.message?.includes('fetch')) {
      return {
        contract: '',
        manifest: {},
        nef: '',
        success: false,
        error: `Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running. Run: python api_server.py`,
      };
    }
    
    return {
      contract: '',
      manifest: {},
      nef: '',
      success: false,
      error: error.message || 'Failed to export contract. Make sure the backend server is running on port 8000.',
    };
  }
}

/**
 * Export contract to persistent files (saves to generated_contracts/ directory and Supabase)
 * Returns file paths where NEF and manifest are saved
 */
export async function exportContractToFiles(
  diagram: DiagramData,
  userId?: string,
  projectId?: string
): Promise<ExportContractResponse> {
  try {
    const body: any = {
      ...diagram,
    };
    if (userId) body.user_id = userId;
    if (projectId) body.project_id = projectId;
    
    const response = await fetch(`${API_BASE_URL}/export-contract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: ExportContractResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to export contract to files:', error);
    
    // Check if it's a network error (backend not running)
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError' ||
        error.message?.includes('fetch')) {
      return {
        contract: '',
        manifest: {},
        nef: '',
        success: false,
        error: `Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running. Run: python api_server.py`,
      };
    }
    
    return {
      contract: '',
      manifest: {},
      nef: '',
      success: false,
      error: error.message || 'Failed to export contract. Make sure the backend server is running on port 8000.',
    };
  }
}

export interface DeployContractResponse {
  tx_hash: string | null;
  contract_hash?: string | null;  // Contract hash (0x...)
  success: boolean;
  error?: string;
  mock?: boolean;
}

export interface DeployContractRequest {
  nef?: string;
  manifest?: Record<string, any>;
  private_key?: string;
  rpc_url?: string;
  network?: string;
  contract_id?: string;  // Supabase contract ID
  user_id?: string;  // User ID for Supabase lookup
}

export interface ExecuteWorkflowResponse {
  execution_logs: any[];
  final_memory: Record<string, any>;
  success: boolean;
  error?: string;
  execution_trace?: any[];
  memory_state?: Record<string, any>;
  logs?: string[];
}

/**
 * Deploy contract to Neo N3 TestNet
 * 
 * @param nef - Optional: Base64 encoded NEF file (if not provided, backend reads from disk)
 * @param manifest - Optional: Contract manifest JSON (if not provided, backend reads from disk)
 * @param privateKey - Optional: WIF private key (if not provided, backend uses NEO_PRIVATE_KEY from .env)
 * @param rpcUrl - Optional: RPC URL (if not provided, backend uses NEO_RPC_URL from .env)
 * @param network - Optional: Network name (if not provided, backend uses NEO_NETWORK from .env)
 */
export async function deployContract(
  nef?: string, 
  manifest?: Record<string, any>,
  privateKey?: string,
  rpcUrl?: string,
  network?: string,
  contractId?: string,
  userId?: string
): Promise<DeployContractResponse> {
  try {
    // Build request body with optional parameters
    const body: any = {};
    
    // Add Supabase contract ID if provided (will fetch from Supabase)
    if (contractId) {
      body.contract_id = contractId;
      if (userId) body.user_id = userId;
    }
    
    // Add NEF and manifest if provided (only if not using Supabase)
    if (!contractId && nef && manifest) {
      body.nef = nef;
      body.manifest = manifest;
    }
    
    // Add optional configuration (backend will use .env as fallback)
    if (privateKey) {
      // Validate private key format before sending
      const trimmedKey = privateKey.trim();
      if (!trimmedKey.startsWith('L') && !trimmedKey.startsWith('K')) {
        return {
          tx_hash: null,
          success: false,
          error: 'Invalid private key format! Must be WIF format (starts with L or K).',
          mock: false,
        };
      }
      body.private_key = trimmedKey;
      console.log(`[DEBUG] Using provided private key: ${trimmedKey.substring(0, 5)}...`);
    }
    
    if (rpcUrl) {
      body.rpc_url = rpcUrl.trim();
      console.log(`[DEBUG] Using provided RPC URL: ${rpcUrl}`);
    }
    
    if (network) {
      body.network = network.trim();
      console.log(`[DEBUG] Using provided network: ${network}`);
    }
    
    console.log('🚀 Deploying contract from generated_contracts/...');
    if (!privateKey) {
      console.log('   Using private key from .env file (NEO_PRIVATE_KEY)');
    }
    
    const response = await fetch(`${API_BASE_URL}/deploy-contract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: DeployContractResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to deploy contract:', error);
    
    // Check if it's a network error (backend not running)
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError' ||
        error.message?.includes('fetch')) {
      return {
        tx_hash: null,
        success: false,
        error: `Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running. Run: python api_server.py`,
        mock: true,
      };
    }
    
    return {
      tx_hash: null,
      success: false,
      error: error.message || 'Failed to deploy contract. Make sure the backend server is running on port 8000.',
      mock: true,
    };
  }
}

/**
 * Execute a ChainChart workflow diagram
 * This calls the deployed contract methods and executes the workflow
 */
export async function executeWorkflow(diagram: DiagramData): Promise<ExecuteWorkflowResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/execute-chainchart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diagram),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: ExecuteWorkflowResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to execute workflow:', error);
    
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError' ||
        error.message?.includes('fetch')) {
      return {
        execution_logs: [],
        final_memory: {},
        success: false,
        error: `Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running. Run: python api_server.py`,
      };
    }
    
    return {
      execution_logs: [],
      final_memory: {},
      success: false,
      error: error.message || 'Failed to execute workflow. Make sure the backend server is running on port 8000.',
    };
  }
}

