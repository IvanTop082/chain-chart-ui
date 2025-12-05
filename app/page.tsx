'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Box, Layers, Zap, Hexagon, Plus, TrendingUp, Lightbulb, FileCode, Clock, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import AuthModal from '@/components/auth/AuthModal';
import Navigation from '@/components/Navigation';
import { getProjects, type Project } from '@/lib/supabase/storage';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const loadedProjects = await getProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  // If user is logged in, show dashboard
  if (user && !loading) {
    const recentProjects = projects.slice(0, 3);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const draftProjects = projects.filter(p => p.status === 'draft').length;

    return (
      <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
        <Navigation />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
              </h1>
              <p className="text-gray-400">Ready to build your next smart contract?</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={FileCode}
                label="Total Projects"
                value={totalProjects}
                color="text-neon-yellow"
                bgColor="rgba(244, 228, 9, 0.1)"
              />
              <StatCard
                icon={TrendingUp}
                label="Active Contracts"
                value={activeProjects}
                color="text-emerald-green"
                bgColor="rgba(0, 255, 127, 0.1)"
              />
              <StatCard
                icon={Clock}
                label="Drafts"
                value={draftProjects}
                color="text-purple-400"
                bgColor="rgba(168, 85, 247, 0.1)"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Projects */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
                  <Link href={createPageUrl('Contracts')}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      View All <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                {projectsLoading ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                    <div className="text-gray-400">Loading projects...</div>
                  </div>
                ) : recentProjects.length > 0 ? (
                  <div className="space-y-3">
                    {recentProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                    <Box className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                    <p className="text-gray-400 mb-4">Create your first smart contract to get started</p>
                    <Link href={createPageUrl('Builder')}>
                      <Button className="bg-neon-yellow text-black hover:bg-[#DCD008] font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Create Project
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Advice & Tips Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-neon-yellow" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Link href={createPageUrl('Builder')}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10"
                      >
                        <Plus className="w-4 h-4 mr-2" /> New Project
                      </Button>
                    </Link>
                    <Link href={createPageUrl('Contracts')}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10"
                      >
                        <FileCode className="w-4 h-4 mr-2" /> My Contracts
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Tips & Advice */}
                <div className="bg-gradient-to-br from-neon-yellow/10 to-emerald-green/10 border border-neon-yellow/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-neon-yellow" />
                    Pro Tips
                  </h3>
                  <div className="space-y-4 text-sm">
                    <TipItem
                      title="Start with State Nodes"
                      description="Define your contract's variables first, then connect them to functions."
                    />
                    <TipItem
                      title="Use Conditions Wisely"
                      description="Add conditional logic to create secure access controls and validations."
                    />
                    <TipItem
                      title="Test Before Deploy"
                      description="Review the generated Solidity code in the terminal before deploying."
                    />
                  </div>
                </div>

                {/* Getting Started */}
                {totalProjects === 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-3">Getting Started</h3>
                    <ol className="space-y-3 text-sm text-gray-300">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-yellow text-black font-bold flex items-center justify-center text-xs">1</span>
                        <span>Click "New Project" to create your first contract</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-yellow text-black font-bold flex items-center justify-center text-xs">2</span>
                        <span>Drag nodes from the palette onto the canvas</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-yellow text-black font-bold flex items-center justify-center text-xs">3</span>
                        <span>Connect nodes to build your contract logic</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-yellow text-black font-bold flex items-center justify-center text-xs">4</span>
                        <span>Watch your Solidity code generate in real-time</span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div 
        className="absolute top-20 left-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(244, 228, 9, 0.1)' }}
      />
      <div 
        className="absolute bottom-20 right-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(0, 255, 127, 0.1)' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.05)'
            }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse relative"
              style={{ 
                backgroundColor: '#F4E409',
                boxShadow: '0 0 8px #F4E409, 0 0 16px rgba(244, 228, 9, 0.5)'
              }}
            />
            <span className="text-sm font-medium text-gray-300">ChainChart Builder v1.0 is live</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Build Smart Contracts <br />
            <span 
              className="text-transparent bg-clip-text inline-block relative"
              style={{
                backgroundImage: 'linear-gradient(to right, #F4E409, #00ff7f)',
                filter: 'drop-shadow(0 0 10px rgba(244, 228, 9, 0.5)) drop-shadow(0 0 20px rgba(0, 255, 127, 0.3))'
              }}
            >
              Visually.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            No code required. Drag, drop, and connect logic pieces to create 
            secure, audit-ready smart contracts for Ethereum and EVM chains.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href={createPageUrl('Builder')}>
                <Button 
                  className="h-14 px-8 text-lg text-black font-bold rounded-full transition-all relative overflow-hidden"
                  style={{
                    backgroundColor: '#F4E409',
                    boxShadow: '0 0 20px rgba(244, 228, 9, 0.4), 0 0 40px rgba(244, 228, 9, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#DCD008';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(244, 228, 9, 0.6), 0 0 60px rgba(244, 228, 9, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4E409';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 228, 9, 0.4), 0 0 40px rgba(244, 228, 9, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <span className="relative z-10">Start Building Now</span>
                  <ArrowRight className="ml-2 w-5 h-5 relative z-10" />
                  <div 
                    className="absolute inset-0 opacity-30 blur-xl"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(244, 228, 9, 0.8), transparent 70%)'
                    }}
                  />
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="h-14 px-8 text-lg text-black font-bold rounded-full transition-all relative overflow-hidden"
                style={{
                  backgroundColor: '#F4E409',
                  boxShadow: '0 0 20px rgba(244, 228, 9, 0.4), 0 0 40px rgba(244, 228, 9, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DCD008';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(244, 228, 9, 0.6), 0 0 60px rgba(244, 228, 9, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4E409';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 228, 9, 0.4), 0 0 40px rgba(244, 228, 9, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)';
                }}
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="ml-2 w-5 h-5 relative z-10" />
                <div 
                  className="absolute inset-0 opacity-30 blur-xl"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(244, 228, 9, 0.8), transparent 70%)'
                  }}
                />
              </Button>
            )}
            {user ? (
              <Link href={createPageUrl('Contracts')}>
                <Button 
                  variant="outline" 
                  className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.2), inset 0 0 25px rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.05)';
                  }}
                >
                  View Templates
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all"
                onClick={() => {
                  setAuthMode('signin');
                  setShowAuthModal(true);
                }}
                style={{
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.2), inset 0 0 25px rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.05)';
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left"
        >
          <FeatureCard 
            icon={Box} 
            title="Drag & Drop Logic" 
            desc="Intuitive node-based editor for managing state, functions, and modifiers."
            color="text-neon-yellow"
          />
          <FeatureCard 
            icon={Zap} 
            title="Instant Deploy" 
            desc="One-click deployment to Sepolia, Goerli, and Mainnet with automated verification."
            color="text-emerald-green"
          />
          <FeatureCard 
            icon={Hexagon} 
            title="Visual Audits" 
            desc="Real-time security analysis visualizing logic flows and potential vulnerabilities."
            color="text-purple-400" 
          />
        </motion.div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}

// Dashboard Components
function StatCard({ icon: Icon, label, value, color, bgColor }: { icon: any; label: string; value: number; color: string; bgColor: string }) {
  return (
    <div 
      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
      style={{
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  
  return (
    <div
      onClick={() => router.push(`${createPageUrl('Builder')}?projectId=${project.id}`)}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-neon-yellow/50 hover:bg-white/10 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-neon-yellow transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-400 mb-2 line-clamp-1">
            {project.description || 'No description'}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(project.updated_at).toLocaleDateString()}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              project.status === 'active' 
                ? 'bg-emerald-green/10 text-emerald-green border border-emerald-green/20' 
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}>
              {project.status}
            </span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-neon-yellow transition-colors ml-4" />
      </div>
    </div>
  );
}

function TipItem({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  const colorValue = color.includes('neon-yellow') ? '#F4E409' : color.includes('emerald-green') ? '#00ff7f' : '#a855f7';
  
  return (
    <div 
      className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group relative overflow-hidden"
      style={{
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.02)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 30px ${colorValue}40, 0 0 60px ${colorValue}20, inset 0 0 30px rgba(255, 255, 255, 0.05)`;
        e.currentTarget.style.borderColor = `${colorValue}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <div 
        className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-4 border transition-all relative overflow-hidden"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: `0 0 10px ${colorValue}20`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${colorValue}60`;
          e.currentTarget.style.boxShadow = `0 0 20px ${colorValue}40, inset 0 0 10px ${colorValue}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = `0 0 10px ${colorValue}20`;
        }}
      >
        <Icon 
          className={`w-6 h-6 ${color} transition-all`}
          style={{
            filter: 'drop-shadow(0 0 4px currentColor)'
          }}
        />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}