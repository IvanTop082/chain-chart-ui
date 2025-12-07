'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Save, RotateCcw, LogOut, ChevronDown, Check, Plus, FileCode, Rocket, ExternalLink, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
// Using server-side signing with .env private key (no wallet connection needed)

// Components
import NodePalette from '@/components/NodePalette';
import Canvas from '@/components/Canvas';
import CodeTerminal from '@/components/CodeTerminal';
import Tutorial from '@/components/tutorial/Tutorial';
import Navigation from '@/components/Navigation';
import Inspector from '@/components/Inspector';
import DeploymentSuccessModal from '@/components/DeploymentSuccessModal';
import { saveProject, getProject, createProject, getProjects, type Project, saveContract, getContract, getLatestContract, updateContractDeployment, type Contract } from '@/lib/supabase/storage';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { exportContract, exportContractToFiles, deployContract, executeWorkflow } from '@/lib/api';

export default function Builder() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, hasCompletedTutorial, tutorialStatusLoaded } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showTutorial, setShowTutorial] = useState(false);
  
  // --- State ---
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewState, setViewState] = useState({ x: 0, y: 0, k: 1 });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingToFiles, setIsExportingToFiles] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedTxHash, setDeployedTxHash] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [currentContractId, setCurrentContractId] = useState<string | null>(null);  // Supabase contract ID
  const [showDeploymentSuccess, setShowDeploymentSuccess] = useState(false);
  const [deploymentInfo, setDeploymentInfo] = useState<{ contractHash: string | null; txHash: string | null } | null>(null);

  // --- Actions ---
  
  // Add Node
  const addNode = (type: string, position?: { x: number; y: number }) => {
    // If no position provided, center in current view
    if (!position) {
        // Center of screen is roughly width/2, height/2 (approx 600, 400) relative to transform
        // WorldX = (ScreenX - Tx) / Tk
        const screenX = window.innerWidth / 2 - 300; // minus sidebar width approx
        const screenY = window.innerHeight / 2;
        const x = (screenX - viewState.x) / viewState.k;
        const y = (screenY - viewState.y) / viewState.k;
        position = { x, y };
    }
    const id = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newNode = {
      id,
      type,
      label: `New ${type}`,
      value: '',
      position,
      metadata: {},
      connections: { inputs: [], outputs: [] }
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  // Remove Node
  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => !e.from.startsWith(id) && !e.to.startsWith(id)));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // Update Node
  const updateNode = (id: string, data: any) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  };

  // Connect Nodes
  const connectNodes = (sourceId: string, targetId: string) => {
    // Prevent duplicates
    const exists = edges.find(e => e.from === sourceId && e.to === targetId);
    if (exists) return;

    setEdges(prev => [...prev, { from: sourceId, to: targetId }]);
  };

  // Remove Edge (Connection)
  const removeEdge = (edgeIndex: number) => {
    setEdges(prev => prev.filter((_, i) => i !== edgeIndex));
  };

  // --- Data Management ---
  
  // Check auth and tutorial on mount
  useEffect(() => {
    if (!authLoading && tutorialStatusLoaded) {
      if (!user) {
        router.push('/');
        return;
      }
      // Only show tutorial if status is loaded and user hasn't completed it
      if (!hasCompletedTutorial) {
        setShowTutorial(true);
      } else {
        setShowTutorial(false);
      }
    }
  }, [user, authLoading, hasCompletedTutorial, tutorialStatusLoaded, router]);

  // Save project to Supabase
  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save projects');
      return;
    }

    setSaving(true);
    try {
      if (!projectId) {
        // Create new project
        const newProject = await createProject(projectName || 'Untitled');
        setProjectId(newProject.id);
        await saveProject({
          id: newProject.id,
          name: projectName || 'Untitled',
          nodes,
          edges
        });
        toast.success('Project created and saved!', {
          description: `${projectName || 'Untitled'} has been saved to your account.`,
        });
      } else {
        // Update existing project
        await saveProject({
          id: projectId,
          name: projectName || 'Untitled',
          nodes,
          edges
        });
        toast.success('Project saved!', {
          description: 'Your changes have been saved successfully.',
        });
      }
    } catch (error: any) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project', {
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const serializeDiagram = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    // Download as file
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'chainchart_logic'}_${Date.now()}.json`;
    a.click();
  };

  // Generate Smart Contract using SpoonOS LLM
  // This single function: generates contract, compiles it, and saves files
  const handleGenerateContract = async () => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to generate a contract.');
      return;
    }

    setIsExportingToFiles(true);

    try {
      toast.info('Generating contract with SpoonOS LLM...', { duration: 3000 });
      
      // This endpoint uses SpoonOS LLM to generate contract from graph (nodes + edges)
      const result = await exportContractToFiles({ nodes, edges });

      if (result.success) {
        const nefPath = result.nef_path || 'generated_contracts/contract.nef';
        const manifestPath = result.manifest_path || 'generated_contracts/contract.manifest.json';
        
        // Save to Supabase from frontend (if user is authenticated)
        if (user) {
          try {
            // Extract contract name from the contract code
            const contractNameMatch = result.contract.match(/class\s+(\w+)\s*:/) || result.contract.match(/public\s+class\s+(\w+)\s*:/);
            const contractName = contractNameMatch ? contractNameMatch[1] : 'Contract';
            
            // Convert NEF from base64 to string for storage
            const nefBase64 = result.nef || '';
            
            const savedContract = await saveContract({
              contract_name: contractName,
              contract_code: result.contract,
              nef_data: nefBase64,
              manifest_data: result.manifest,
              project_id: projectId || undefined,
              status: 'compiled',
            });
            
            if (savedContract) {
              setCurrentContractId(savedContract.id);
              toast.success('Smart Contract Generated!', {
                description: `Contract generated and saved to Supabase.\nName: ${contractName}\nFiles: ${nefPath}\n${manifestPath}`,
                duration: 8000,
              });
            } else {
              throw new Error('Failed to save to Supabase');
            }
          } catch (error: any) {
            console.error('Failed to save contract to Supabase:', error);
            // Still show success for filesystem save
            toast.success('Smart Contract Generated!', {
              description: `Contract generated successfully.\nFiles: ${nefPath}\n${manifestPath}\n(Note: Failed to save to Supabase)`,
              duration: 8000,
            });
          }
        } else {
          // Not authenticated - just show filesystem success
          toast.success('Smart Contract Generated!', {
            description: `Contract generated using SpoonOS LLM and compiled successfully.\nFiles saved to:\n${nefPath}\n${manifestPath}`,
            duration: 8000,
          });
        }
      } else {
        const errorMsg = result.error || 'Failed to generate contract';
        toast.error('Contract Generation Failed', {
          description: errorMsg,
          duration: 10000,
        });
      }
    } catch (error: any) {
      console.error('Generate contract error:', error);
      toast.error('Failed to generate contract', {
        description: error.message || 'Make sure the backend server is running and SpoonOS LLM is configured.',
        duration: 10000,
      });
    } finally {
      setIsExportingToFiles(false);
    }
  };

  // Execute Workflow - Test the deployed contract
  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to execute a workflow.');
      return;
    }

    setIsExecuting(true);
    setExecutionResults(null);

    try {
      toast.info('Executing workflow...', { duration: 2000 });
      const result = await executeWorkflow({ nodes, edges });

      if (result.success) {
        setExecutionResults(result);
        toast.success('Workflow executed successfully!', {
          description: `Executed ${result.execution_logs?.length || 0} steps`,
          duration: 5000,
        });
      } else {
        const errorMsg = result.error || 'Workflow execution failed';
        toast.error('Workflow Execution Failed', {
          description: errorMsg,
          duration: 10000,
        });
        setExecutionResults(result); // Still show results even if failed
      }
    } catch (error: any) {
      console.error('Execute workflow error:', error);
      toast.error('Failed to execute workflow', {
        description: error.message || 'Make sure the backend server is running and contract is deployed.',
        duration: 10000,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Deploy Contract to Neo TestNet (using private key from .env file via backend)
  const handleDeployContract = async () => {
    setIsDeploying(true);
    setDeployedTxHash(null);

    try {
      toast.info('Deploying contract to TestNet...', { duration: 3000 });
      
      // Fetch contract from Supabase if we have a contract_id, otherwise use filesystem
      let nefData: string | undefined;
      let manifestData: Record<string, any> | undefined;
      
      if (currentContractId && user) {
        try {
          const contract = await getContract(currentContractId);
          if (contract && contract.nef_data && contract.manifest_data) {
            nefData = contract.nef_data;  // Already base64
            manifestData = contract.manifest_data;
            toast.info('Using contract from Supabase...', { duration: 2000 });
          }
        } catch (error) {
          console.error('Failed to fetch contract from Supabase:', error);
          // Fall through to filesystem
        }
      }
      
      // Deploy the contract
      // Pass contractId so backend can fetch the correct contract from Supabase
      // If contractId is not set, backend will use the latest file by modification time
      const result = await deployContract(
        nefData,  // nef from Supabase or undefined (will use filesystem)
        manifestData,  // manifest from Supabase or undefined
        undefined,  // privateKey
        undefined,  // rpcUrl
        undefined,  // network
        currentContractId || undefined,  // contractId - tells backend which contract to deploy
        user?.id || undefined  // userId - needed for Supabase lookup
      );
      
      if (result.success) {
        // Update Supabase with deployment info
        if (currentContractId && user) {
          try {
            const contractHash = (result as any).contract_hash;
            await updateContractDeployment(
              currentContractId,
              contractHash,
              result.tx_hash || undefined,
              'deployed'
            );
          } catch (error) {
            console.error('Failed to update Supabase with deployment info:', error);
          }
        }
        
        // Deployment succeeded - may have tx_hash or contract_hash
        const contractHash = result.contract_hash || null;
        const txHash = result.tx_hash || null;
        
        setDeployedTxHash(txHash);
        
        // Show deployment success modal with connection instructions
        setDeploymentInfo({ contractHash, txHash });
        setShowDeploymentSuccess(true);
        
        // Also show a toast notification
        if (txHash) {
          toast.success('Contract deployed successfully!', {
            description: `Click to view deployment details`,
            duration: 5000,
          });
        } else if (contractHash) {
          toast.success('Contract deployed successfully!', {
            description: `Contract hash: ${contractHash}`,
            duration: 5000,
          });
        } else {
          toast.success('Contract deployed successfully!', {
            description: 'View connection instructions in the modal',
            duration: 5000,
          });
        }
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error: any) {
      console.error('Deploy contract error:', error);
      const errorMsg = error.message || 'Failed to deploy contract';
      
      toast.error(`Deployment failed: ${errorMsg}`, {
        description: 'Make sure the backend server is running and NEO_PRIVATE_KEY is set in .env file.',
        duration: 10000,
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Export Smart Contract (download files)
  const handleExportContract = async () => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to export a contract.');
      return;
    }

    setIsExporting(true);

    try {
      const result = await exportContract({ nodes, edges });

      if (result.success) {
        // Download contract file
        const contractBlob = new Blob([result.contract], { type: 'text/plain' });
        const contractUrl = URL.createObjectURL(contractBlob);
        const contractLink = document.createElement('a');
        contractLink.href = contractUrl;
        contractLink.download = `${projectName || 'Contract'}.cs`;
        document.body.appendChild(contractLink);
        contractLink.click();
        document.body.removeChild(contractLink);
        URL.revokeObjectURL(contractUrl);

        // Download manifest file
        const manifestBlob = new Blob([JSON.stringify(result.manifest, null, 2)], { type: 'application/json' });
        const manifestUrl = URL.createObjectURL(manifestBlob);
        const manifestLink = document.createElement('a');
        manifestLink.href = manifestUrl;
        manifestLink.download = `${projectName || 'Contract'}.manifest.json`;
        document.body.appendChild(manifestLink);
        manifestLink.click();
        document.body.removeChild(manifestLink);
        URL.revokeObjectURL(manifestUrl);

        // Download NEF file (base64 decode first)
        if (result.nef) {
          try {
            // Convert base64 to binary
            const binaryString = atob(result.nef);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const nefBlob = new Blob([bytes], { type: 'application/octet-stream' });
            const nefUrl = URL.createObjectURL(nefBlob);
            const nefLink = document.createElement('a');
            nefLink.href = nefUrl;
            nefLink.download = `${projectName || 'Contract'}.nef`;
            document.body.appendChild(nefLink);
            nefLink.click();
            document.body.removeChild(nefLink);
            URL.revokeObjectURL(nefUrl);
          } catch (nefError) {
            console.error('Failed to download NEF file:', nefError);
            toast.error('Contract and manifest downloaded, but NEF file download failed.');
          }
        }

        toast.success('Smart contract exported successfully!');
      } else {
        const errorMsg = result.error || 'Failed to export contract';
        // Filter out compiler installation warnings and auto-fixed errors
        // (DisplayName errors are automatically fixed by the validator)
        const criticalErrors = result.compile_errors?.filter(
          (e: string) => !e.toLowerCase().includes('compiler') && 
                         !e.toLowerCase().includes('devpack') && 
                         !e.toLowerCase().includes('install') &&
                         !e.toLowerCase().includes('displayname')
        ) || [];
        
        if (criticalErrors.length > 0) {
          toast.error(`Contract validation errors: ${criticalErrors.join('; ')}`);
          console.error('Validation errors:', criticalErrors);
        } else {
          // Only show compiler installation warnings in console, not as toast
          if (result.compile_errors && result.compile_errors.length > 0) {
            console.warn('Compiler installation warnings (expected if compiler not installed):', result.compile_errors);
          }
          toast.error(errorMsg);
        }
      }
    } catch (error: any) {
      console.error('Export contract error:', error);
      toast.error(error.message || 'Failed to export contract. Make sure the backend server is running.');
    } finally {
      setIsExporting(false);
    }
  };

  const loadDiagram = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          if (data.nodes && data.edges) {
            setNodes(data.nodes);
            setEdges(data.edges);
          }
        }
      } catch (err) {
        console.error("Failed to parse diagram", err);
        toast.error('Failed to load diagram', {
          description: 'Please check that the file is a valid ChainChart diagram.',
        });
      }
    };
    reader.readAsText(file);
  };

  // Load projects list and current project on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    
    loadProjectsList();
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('projectId');
    if (id) {
      loadProject(id);
    } else {
      // If no projectId, create a new project
      createNewProject();
    }
  }, [user]);

  const loadProjectsList = async () => {
    try {
      const allProjects = await getProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Failed to load projects list:', error);
    }
  };

  const createNewProject = async () => {
    try {
      const newProject = await createProject('Untitled Project');
      setProjectId(newProject.id);
      setProjectName(newProject.name);
      setNodes([]);
      setEdges([]);
      router.replace(`/builder?projectId=${newProject.id}`);
      await loadProjectsList();
    } catch (error) {
      console.error('Failed to create new project:', error);
    }
  };

  const loadProject = async (id: string) => {
    try {
      const project = await getProject(id);
      if (project) {
        setProjectId(project.id);
        setProjectName(project.name);
        setNodes(project.nodes || []);
        setEdges(project.edges || []);
        setLastSaved(project.updated_at ? new Date(project.updated_at) : null);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  // Auto-save functionality (debounced)
  useEffect(() => {
    if (!autoSaveEnabled || !projectId || !user) return;

    const timeoutId = setTimeout(async () => {
      try {
        setSaving(true);
        await saveProject({
          id: projectId,
          name: projectName || 'Untitled',
          nodes,
          edges
        });
        setLastSaved(new Date());
        // Silent success - don't show toast for auto-save
      } catch (error: any) {
        console.error('Auto-save failed:', error);
        toast.error('Auto-save failed', {
          description: 'Your changes may not be saved. Try saving manually.',
        });
      } finally {
        setSaving(false);
      }
    }, 2000); // Debounce: save 2 seconds after last change

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, projectName, projectId, autoSaveEnabled, user]);

  const handleSwitchProject = async (projectId: string) => {
    try {
      router.push(`/builder?projectId=${projectId}`);
      await loadProject(projectId);
      toast.success('Project loaded', {
        description: 'Your project has been loaded successfully.',
      });
    } catch (error: any) {
      toast.error('Failed to load project', {
        description: error.message || 'An error occurred. Please try again.',
      });
    }
  };

  // --- Keyboard Events ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete if not editing input
        const target = e.target as HTMLElement;
        if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && selectedNodeId) {
          removeNode(selectedNodeId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId]);

  // --- Drag & Drop from Palette ---
  const handleDrop = (e: any) => {
    // preventDefault is already called in Canvas component
    const type = e.dataTransfer?.getData('application/reactflow');
    if (type) {
      // Use world coordinates from Canvas if available
      let worldX: number;
      let worldY: number;
      
      if (e.worldX !== undefined && e.worldY !== undefined) {
        // Canvas provided world coordinates
        worldX = e.worldX;
        worldY = e.worldY;
      } else {
        // Fallback: calculate from screen coordinates
        const canvasElement = e.currentTarget as HTMLElement;
        const rect = canvasElement.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates using current transform
        worldX = (screenX - viewState.x) / viewState.k;
        worldY = (screenY - viewState.y) / viewState.k;
      }
      
      // Snap to grid
      const snapSize = 10;
      const snappedX = Math.round(worldX / snapSize) * snapSize;
      const snappedY = Math.round(worldY / snapSize) * snapSize;
      
      addNode(type, { x: snappedX, y: snappedY });
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('project-menu');
      const button = event.target as HTMLElement;
      if (menu && !menu.contains(button) && !button.closest('[data-project-selector]')) {
        menu.classList.add('hidden');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Navigation />
      
      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}

      {/* Toolbar */}
      <div className="h-12 border-b border-border bg-card/60 backdrop-blur-xl flex items-center px-4 justify-between" style={{ position: 'relative', zIndex: 100 }}>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* Project Selector */}
          <div className="relative" data-project-selector>
            <Button
              variant="ghost"
              className="h-8 px-3 text-foreground hover:bg-accent font-semibold"
              onClick={(e) => {
                const menu = document.getElementById('project-menu');
                const button = e.currentTarget;
                const rect = button.getBoundingClientRect();
                if (menu) {
                  const isHidden = menu.classList.contains('hidden');
                  if (isHidden) {
                    // Position dropdown right below the button before showing
                    menu.style.top = `${rect.bottom + 1}px`;
                    menu.style.left = `${rect.left}px`;
                  }
                  menu.classList.toggle('hidden');
                }
              }}
            >
              {projectName || 'Untitled'}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <div
              id="project-menu"
              className="hidden w-64 bg-popover border border-border rounded-lg shadow-2xl overflow-hidden"
              style={{ 
                zIndex: 9999,
                position: 'fixed',
              }}
            >
              <div className="px-3 py-2 text-xs text-muted-foreground font-semibold border-b border-border">Switch Project</div>
              <div className="max-h-64 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      handleSwitchProject(project.id);
                      const menu = document.getElementById('project-menu');
                      if (menu) menu.classList.add('hidden');
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-accent transition-colors ${
                      project.id === projectId
                        ? 'bg-accent text-accent-foreground'
                        : 'text-popover-foreground'
                    }`}
                  >
                    <span className="truncate">{project.name}</span>
                    {project.id === projectId && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-border">
                <button
                  onClick={() => {
                    createNewProject();
                    const menu = document.getElementById('project-menu');
                    if (menu) menu.classList.add('hidden');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </div>

          <Input
            value={projectName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
            className="bg-transparent border-border text-foreground font-bold w-48 h-8 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            placeholder="Project name"
          />
          <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">Draft</span>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {saving && (
            <span className="text-xs text-primary animate-pulse">Saving...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setNodes([])}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
            <label className="cursor-pointer">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground pointer-events-none">
                    <Upload className="w-4 h-4 mr-2" /> Import JSON
                </Button>
                <input type="file" className="hidden" accept=".json" onChange={loadDiagram} />
            </label>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent" onClick={serializeDiagram}>
                <Download className="w-4 h-4 mr-2" /> Export JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-border text-foreground hover:bg-accent" 
              onClick={handleExportContract}
              disabled={isExporting || nodes.length === 0}
            >
                <FileCode className="w-4 h-4 mr-2" /> {isExporting ? 'Exporting...' : 'Export Smart Contract'}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-primary text-primary-foreground hover:opacity-90" 
              onClick={handleGenerateContract}
              disabled={isExportingToFiles || nodes.length === 0}
            >
                <FileCode className="w-4 h-4 mr-2" /> {isExportingToFiles ? 'Generating with SpoonOS...' : 'Generate Smart Contract'}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600" 
              onClick={handleDeployContract}
              disabled={isDeploying || nodes.length === 0}
            >
                <Rocket className="w-4 h-4 mr-2" /> {isDeploying ? 'Deploying...' : 'Deploy to TestNet'}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600" 
              onClick={handleExecuteWorkflow}
              disabled={isExecuting || nodes.length === 0}
            >
                <Zap className="w-4 h-4 mr-2" /> {isExecuting ? 'Executing...' : 'Execute Workflow'}
            </Button>
            {deployedTxHash && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border text-foreground hover:bg-accent" 
                onClick={() => window.open(`https://testnet.neotube.org/transaction/${deployedTxHash}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" /> View on TestNet
              </Button>
            )}
            <Button 
              size="sm" 
              className="bg-primary text-primary-foreground hover:opacity-90 font-semibold" 
              onClick={handleSave}
              disabled={saving}
            >
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Now'}
            </Button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex relative" style={{ overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <NodePalette onAddNode={(type: string) => addNode(type)} />
        
        {/* Canvas Area */}
        <div className="flex-1 relative bg-background">
            <Canvas 
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onSelectNode={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
                onConnect={connectNodes}
                onRemoveEdge={removeEdge}
                onViewChange={setViewState}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            />
        </div>

        {/* Right Sidebar - Inspector Panel */}
        {selectedNodeId && (
          <Inspector
            selectedNode={nodes.find(n => n.id === selectedNodeId)}
            onUpdateNode={updateNode}
            onDeleteNode={removeNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}

      </div>
      
      {/* Bottom Terminal */}
      <CodeTerminal nodes={nodes} edges={edges} executionResults={executionResults} />

      {/* Deployment Success Modal */}
      {deploymentInfo && (
        <DeploymentSuccessModal
          open={showDeploymentSuccess}
          onClose={() => {
            setShowDeploymentSuccess(false);
            setDeploymentInfo(null);
          }}
          contractHash={deploymentInfo.contractHash}
          txHash={deploymentInfo.txHash}
          contractName={projectName}
        />
      )}
    </div>
  );
}