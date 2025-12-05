'use client';

import React, { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Save, RotateCcw } from 'lucide-react';

// Components
import NodePalette from '@/components/NodePalette';
import Canvas from '@/components/Canvas';
import Inspector from '@/components/Inspector';
import CodeTerminal from '@/components/CodeTerminal';
import { saveProject, getProject, createProject } from '@/lib/storage';

export default function Builder() {
  // --- State ---
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewState, setViewState] = useState({ x: 0, y: 0, k: 1 });

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
  
  // Save project to local storage
  const handleSave = () => {
    if (!projectId) {
      // Create new project
      const newProject = createProject(projectName || 'Untitled');
      setProjectId(newProject.id);
      saveProject({
        ...newProject,
        nodes,
        edges
      });
    } else {
      // Update existing project
      const project = getProject(projectId);
      if (project) {
        saveProject({
          ...project,
          name: projectName || 'Untitled',
          nodes,
          edges
        });
      }
    }
    // Show success feedback (you could add a toast here)
    alert('Project saved successfully!');
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
        alert('Failed to load diagram. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Load project on mount if projectId is in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('projectId');
    if (id) {
      const project = getProject(id);
      if (project) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setProjectId(project.id);
          setProjectName(project.name);
          setNodes(project.nodes || []);
          setEdges(project.edges || []);
        }, 0);
      }
    }
  }, []);

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
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (type) {
      // Simplified screen-to-canvas logic for drop (better to use the canvas transform logic if exposed)
      // For now, we place it somewhat near the mouse, centered.
      // Ideal: Canvas exposes a method to get world coordinates.
      // Hack: Random offset or center for MVP if transform is complex to access here.
      // We will just add it at fixed pos + random offset for visibility
      addNode(type, { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 });
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-black text-white overflow-hidden">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 justify-between z-20 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-sm text-gray-400">
            <Input
              value={projectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
              className="bg-transparent border-white/20 text-white font-bold w-48 h-8 text-sm focus-visible:ring-1 focus-visible:ring-neon-yellow"
              placeholder="Project name"
            />
            <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">Draft</span>
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
            <Button size="sm" className="bg-neon-yellow text-black hover:bg-[#DCD008] font-bold" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Save
            </Button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar */}
        <NodePalette onAddNode={(type: string) => addNode(type)} />
        
        {/* Canvas Area */}
        <div 
            className="flex-1 relative bg-black"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <Canvas 
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onSelectNode={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
                onConnect={connectNodes}
                onViewChange={setViewState}
            />
        </div>

        {/* Right Sidebar (Inspector) */}
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
      <CodeTerminal nodes={nodes} edges={edges} />
    </div>
  );
}