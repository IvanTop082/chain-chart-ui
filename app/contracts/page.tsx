'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, Box, FileCode, Calendar, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Link from 'next/link';
import { getProjects, type Project } from '@/lib/storage';

export default function Contracts() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load projects from local storage
    const loadedProjects = getProjects();
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setProjects(loadedProjects);
    }, 0);
  }, []);

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Contracts</h1>
          <p className="text-gray-400">Manage and deploy your blockchain logic</p>
        </div>
        <Link href={createPageUrl('Builder')}>
            <Button className="bg-neon-yellow text-black hover:bg-[#DCD008] font-bold">
            + New Contract
            </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 mb-6 bg-white/5 p-2 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search contracts..." 
            className="bg-transparent border-none pl-9 text-white placeholder:text-gray-600 focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="h-6 w-[1px] bg-white/10" />
        <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">All Status</Button>
        <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">Recent</Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Box className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No contracts found</p>
            <p className="text-sm text-gray-500">Create your first contract to get started</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="group bg-black border border-white/10 rounded-2xl p-6 hover:border-neon-yellow/50 hover:shadow-[0_0_20px_rgba(244,228,9,0.1)] transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
             {/* Glow Effect on Hover */}
             <div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-neon-yellow/30 group-hover:scale-105 transition-all">
                <Box className="w-6 h-6 text-neon-yellow" />
              </div>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-neon-yellow transition-colors">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description || 'No description provided.'}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                    <div className="flex items-center gap-1">
                        <FileCode className="w-3 h-3" />
                        <span>ERC-20</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{project.created_date ? new Date(project.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className={`
                        px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                        ${project.status === 'active' ? 'bg-emerald-green/10 text-emerald-green border border-emerald-green/20' : 'bg-gray-800 text-gray-400 border border-gray-700'}
                    `}>
                        {project.status}
                    </span>
                    <Link href={createPageUrl('Builder')} className="text-neon-yellow hover:text-white transition-colors">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}