'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, Box, FileCode, Calendar, ArrowRight, LogOut } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Link from 'next/link';
import { getProjects, deleteProject, type Project } from '@/lib/supabase/storage';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function Contracts() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      loadProjects();
    }
  }, [user, authLoading, router]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const loadedProjects = await getProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await deleteProject(projectToDelete);
      await loadProjects();
      toast.success('Project deleted', {
        description: 'The project has been permanently removed.',
      });
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project', {
        description: 'An error occurred while deleting. Please try again.',
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Navigation />
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full scrollbar-hide">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Contracts</h1>
          <p className="text-muted-foreground">Manage and deploy your blockchain logic</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={createPageUrl('Builder')}>
            <Button 
              className="bg-neon-yellow text-black hover:bg-[#DCD008] font-bold"
              style={{
                backgroundColor: '#F4E409',
                boxShadow: '0 0 20px rgba(244, 228, 9, 0.4)'
              }}
            >
              + New Contract
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
            onClick={async () => {
              await signOut();
              router.push('/');
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 mb-6 bg-card/50 p-2 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search contracts..." 
            className="bg-transparent border-none pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="h-6 w-[1px] bg-border" />
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">All Status</Button>
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">Recent</Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No contracts found</p>
            <p className="text-sm text-muted-foreground">Create your first contract to get started</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`${createPageUrl('Builder')}?projectId=${project.id}`)}
            className="group bg-card/50 border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
             {/* Glow Effect on Hover */}
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center border border-border group-hover:border-primary/30 group-hover:scale-105 transition-all">
                <Box className="w-6 h-6 text-primary" />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => handleDeleteClick(project.id, e)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description || 'No description provided.'}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                        <FileCode className="w-3 h-3" />
                        <span>ERC-20</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className={`
                        px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                        ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}
                    `}>
                        {project.status}
                    </span>
                    <div className="text-primary group-hover:text-foreground transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
          </div>
        ))
        )}
      </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  );
}