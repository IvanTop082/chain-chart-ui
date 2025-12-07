/**
 * Helper functions for loading and working with generated contracts
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface GeneratedContract {
  nefBase64: string;
  manifest: Record<string, any>;
}

/**
 * Load the latest generated NEF and manifest from the backend
 * This reads from generated_contracts/contract.nef and contract.manifest.json
 */
export async function loadGeneratedContract(): Promise<GeneratedContract> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contract/latest`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      if (response.status === 404) {
        throw new Error(
          `Contract files not found. Please click "Generate Smart Contract" first to create the NEF and manifest files. ` +
          `The files should be saved to: ${API_BASE_URL}/generated_contracts/contract.nef and contract.manifest.json`
        );
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.nefBase64 || !data.manifest) {
      throw new Error('Invalid response: missing NEF or manifest data');
    }

    return {
      nefBase64: data.nefBase64,
      manifest: data.manifest,
    };
  } catch (error: any) {
    console.error('Failed to load generated contract:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(
        `Cannot connect to backend server at ${API_BASE_URL}. ` +
        'Make sure the backend is running. Start it with: python api_server.py'
      );
    }
    
    throw new Error(
      error.message || 
      'Failed to load generated contract files. Make sure you have generated a contract first (click "Generate Smart Contract") and the backend server is running.'
    );
  }
}

