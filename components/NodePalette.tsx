'use client';

import React, { useRef, useEffect } from 'react';
import { Circle, Square, Hexagon, Box, MousePointer2 } from 'lucide-react';

// Custom Parallelogram Icon Component
const ParallelogramIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
  return (
    <svg 
      className={className} 
      style={style}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="4,6 20,6 18,18 2,18" />
    </svg>
  );
};
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
    icon: ParallelogramIcon, 
    description: 'Emit Logs', 
    shape: 'parallelogram',
    color: '#ffee58'
  }
];

// Draggable Node Item Component
function DraggableNodeItem({ item, onAddNode }: { item: typeof NODE_TYPES[0]; onAddNode: (type: string) => void }) {
  const itemRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = itemRef.current;
    if (!element) return;
    
    const handleDragStart = (e: DragEvent) => {
      e.dataTransfer?.setData('application/reactflow', item.type);
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
      }
    };
    
    element.addEventListener('dragstart', handleDragStart);
    return () => element.removeEventListener('dragstart', handleDragStart);
  }, [item.type]);
  
  return (
    <motion.div
      ref={itemRef}
      draggable
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
          {item.type === 'event' ? (
            <ParallelogramIcon className="w-5 h-4" style={{ color: item.color, transform: 'scaleX(1.3)' }} />
          ) : (
            <item.icon className={`w-4 h-4 ${item.shape === 'diamond' ? 'rotate-45' : ''}`} />
          )}
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
  );
}

export default function NodePalette({ onAddNode }: { onAddNode: (type: string) => void }) {
  return (
    <div className="w-64 bg-black border-r border-white/10 flex flex-col h-full relative shadow-xl" style={{ zIndex: 10 }}>
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h2 className="text-sm font-bold text-neon-yellow uppercase tracking-wider flex items-center gap-2">
          <MousePointer2 className="w-4 h-4" /> Logic Shapes
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {NODE_TYPES.map((item) => (
          <DraggableNodeItem key={item.type} item={item} onAddNode={onAddNode} />
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