'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Box, Layers, Zap, Hexagon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Home() {
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
            <Link href={createPageUrl('Builder')}>
              <Button 
                className="h-14 px-8 text-lg text-black font-bold rounded-full transition-all"
                style={{
                  backgroundColor: '#F4E409',
                  boxShadow: '0 0 20px rgba(244, 228, 9, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DCD008';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(244, 228, 9, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4E409';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 228, 9, 0.3)';
                }}
              >
                Start Building Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
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