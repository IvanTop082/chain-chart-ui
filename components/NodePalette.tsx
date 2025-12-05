'use client';

import React from 'react';
import { Circle, Square, Hexagon, Triangle, Box, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NODE_TYPES = [
  { 
    type: 'state', 
    label: 'State', 
    icon: Circle, 
    description: 'Variables / Storage',
    shape: 'circle',
    color: '#00ff7f' 
  },
  { 
    type: 'condition', 
    label: 'Condition', 
    icon: Square, 
    description: 'Boolean Check / If', 
    shape: 'diamond',
    color: '#ffee58'
  },
  { 
    type: 'function', 
    label: 'Function', 
    icon: Hexagon, 
    description: 'Actions / External Calls', 
    shape: 'hexagon',
    color: '#00ff7f'
  },
  { 
    type: 'operation', 
    label: 'Operation', 
    icon: Box, 
    description: 'Math / Logic', 
    shape: 'square',
    color: '#00ff7f'
  },
  { 
    type: 'modifier', 
    label: 'Modifier', 
    icon: Hexagon, 
    description: 'Access Control', 
    shape: 'octagon',
    color: '#ffee58'
  },
  { 
    type: 'event', 
    label: 'Event', 
    icon: Triangle, 
    description: 'Emit Logs', 
    shape: 'triangle',
    color: '#ffee58'
  }
];

export default function NodePalette({ onAddNode }) {
  return (
    <div className="w-64 bg-black border-r border-white/10 flex flex-col h-full z-30 relative shadow-xl">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h2 className="text-sm font-bold text-neon-yellow uppercase tracking-wider flex items-center gap-2">
          <MousePointer2 className="w-4 h-4" /> Logic Shapes
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {NODE_TYPES.map((item) => (
          <motion.div
            key={item.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', item.type);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => onAddNode(item.type)}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-grab active:cursor-grabbing p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-1">
              <div 
                className="w-8 h-8 flex items-center justify-center rounded bg-black border"
                style={{ borderColor: item.color, color: item.color }}
              >
                <item.icon className={`w-4 h-4 ${item.shape === 'diamond' ? 'rotate-45' : ''}`} />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-neon-yellow transition-colors">
                  {item.label}
                </div>
                <div className="text-[10px] text-gray-500 font-mono leading-tight">
                  {item.description}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="text-xs text-gray-500 text-center font-mono">
          Drag shapes to canvas
        </div>
      </div>
    </div>
  );
}