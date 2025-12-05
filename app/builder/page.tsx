'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Save, RotateCcw, LogOut, ChevronDown, Check, Plus } from 'lucide-react';

// Components
import NodePalette from '@/components/NodePalette';
import Canvas from '@/components/Canvas';
import CodeTerminal from '@/components/CodeTerminal';
import Tutorial from '@/components/tutorial/Tutorial';
import Navigation from '@/components/Navigation';
import { saveProject, getProject, createProject, getProjects, type Project } from '@/lib/supabase/storage';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function Builder() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, hasCompletedTutorial } = useAuth();
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

  // --- Data Management ---
  
  // Check auth and tutorial on mount
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      if (!hasCompletedTutorial) {
        setShowTutorial(true);
      }
    }
  }, [user, authLoading, hasCompletedTutorial, router]);

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
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <Navigation />
      
      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}

      {/* Toolbar */}
      <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 justify-between backdrop-blur-sm" style={{ position: 'relative', zIndex: 100 }}>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {/* Project Selector */}
          <div className="relative" data-project-selector>
            <Button
              variant="ghost"
              className="h-8 px-3 text-white hover:bg-white/10 font-semibold"
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
              className="hidden w-64 bg-black border border-white/20 rounded-lg shadow-2xl overflow-hidden"
              style={{ 
                zIndex: 9999,
                position: 'fixed',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(244, 228, 9, 0.2)'
              }}
            >
              <div className="px-3 py-2 text-xs text-gray-400 font-semibold border-b border-white/10">Switch Project</div>
              <div className="max-h-64 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      handleSwitchProject(project.id);
                      const menu = document.getElementById('project-menu');
                      if (menu) menu.classList.add('hidden');
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-white/10 transition-colors ${
                      project.id === projectId
                        ? 'bg-neon-yellow/10 text-neon-yellow'
                        : 'text-white'
                    }`}
                  >
                    <span className="truncate">{project.name}</span>
                    {project.id === projectId && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10">
                <button
                  onClick={() => {
                    createNewProject();
                    const menu = document.getElementById('project-menu');
                    if (menu) menu.classList.add('hidden');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-neon-yellow hover:bg-neon-yellow/10 transition-colors flex items-center gap-2"
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
            className="bg-transparent border-white/20 text-white font-bold w-48 h-8 text-sm focus-visible:ring-1 focus-visible:ring-neon-yellow"
            placeholder="Project name"
          />
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">Draft</span>
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {saving && (
            <span className="text-xs text-neon-yellow animate-pulse">Saving...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setNodes([])}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <label className="cursor-pointer">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white pointer-events-none">
                    <Upload className="w-4 h-4 mr-2" /> Import JSON
                </Button>
                <input type="file" className="hidden" accept=".json" onChange={loadDiagram} />
            </label>
            <Button variant="outline" size="sm" className="border-neon-yellow/30 text-neon-yellow hover:bg-neon-yellow/10" onClick={serializeDiagram}>
                <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button 
              size="sm" 
              className="bg-neon-yellow text-black hover:bg-[#DCD008] font-bold" 
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
        <div className="flex-1 relative bg-black">
            <Canvas 
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onSelectNode={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
                onConnect={connectNodes}
                onViewChange={setViewState}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            />
        </div>

      </div>
      
      {/* Bottom Terminal */}
      <CodeTerminal nodes={nodes} edges={edges} />
    </div>
  );
}