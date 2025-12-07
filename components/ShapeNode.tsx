import React from 'react';
import { useTheme } from '@/lib/theme-context';

// Types
interface Node {
  id: string;
  type: string;
  label: string;
  value?: string;
  position: { x: number; y: number };
  metadata?: Record<string, unknown>;
  connections?: { inputs: unknown[]; outputs: unknown[] };
}

interface ShapeNodeProps {
  node: Node;
  isSelected: boolean;
  scale?: number;
}

interface PortProps {
  cx: number;
  cy: number;
  type: string;
  nodeId: string;
  position: string;
  color: string;
  label?: string;
}

// Professional color palette - more variety
const COLORS = {
  // Primary colors
  emerald: '#10b981',      // Green - State
  blue: '#3b82f6',         // Blue - Function
  purple: '#8b5cf6',       // Purple - Operation
  amber: '#f59e0b',        // Amber - Condition
  rose: '#f43f5e',         // Rose - Modifier
  cyan: '#06b6d4',         // Cyan - Event
  
  // Dark mode variants (more vibrant)
  emeraldDark: '#34d399',
  blueDark: '#60a5fa',
  purpleDark: '#a78bfa',
  amberDark: '#fbbf24',
  roseDark: '#fb7185',
  cyanDark: '#22d3ee',
  
  // Light mode variants (more muted)
  emeraldLight: '#059669',
  blueLight: '#2563eb',
  purpleLight: '#7c3aed',
  amberLight: '#d97706',
  roseLight: '#e11d48',
  cyanLight: '#0891b2',
};

type NodeStyle = {
  shape: string;
  color: string;
  colorLight: string;
  colorDark: string;
  glow: string;
  strokeWidth?: number;
};

const NODE_STYLES: Record<string, NodeStyle> = {
  state: {
    shape: 'circle',
    color: COLORS.emerald,
    colorLight: COLORS.emeraldLight,
    colorDark: COLORS.emeraldDark,
    glow: `0 0 15px currentColor`
  },
  condition: {
    shape: 'diamond',
    color: COLORS.amber,
    colorLight: COLORS.amberLight,
    colorDark: COLORS.amberDark,
    glow: `0 0 15px currentColor`
  },
  function: {
    shape: 'hexagon',
    color: COLORS.blue,
    colorLight: COLORS.blueLight,
    colorDark: COLORS.blueDark,
    strokeWidth: 2,
    glow: `0 0 10px currentColor`
  },
  operation: {
    shape: 'square',
    color: COLORS.purple,
    colorLight: COLORS.purpleLight,
    colorDark: COLORS.purpleDark,
    glow: `0 0 10px currentColor`
  },
  modifier: {
    shape: 'octagon',
    color: COLORS.rose,
    colorLight: COLORS.roseLight,
    colorDark: COLORS.roseDark,
    glow: `0 0 10px currentColor`
  },
  event: {
    shape: 'parallelogram',
    color: COLORS.cyan,
    colorLight: COLORS.cyanLight,
    colorDark: COLORS.cyanDark,
    glow: `0 0 10px currentColor`
  }
};

export default function ShapeNode({ node, isSelected }: ShapeNodeProps) {
  const { theme } = useTheme();
  const style = NODE_STYLES[node.type as keyof typeof NODE_STYLES] || NODE_STYLES.state;
  
  // All nodes are the same size
  const size = 100; 
  const half = size / 2;
  
  const isCondition = node.type === 'condition';
  
  // Get color based on theme
  const nodeColor = theme === 'dark' ? style.colorDark : style.colorLight;
  const fillColor = theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)';

  // Determine Shape Path
  const renderShape = () => {
    const stroke = nodeColor;
    const fill = fillColor;
    const strokeWidth = isSelected ? 3 : (style.strokeWidth || 2);
    const filter = isSelected ? `drop-shadow(${style.glow.replace('currentColor', nodeColor)})` : 'none';
    
    const commonProps = {
      stroke,
      fill,
      strokeWidth,
      className: "transition-all duration-200",
      filter
    };

    switch (style.shape) {
      case 'circle':
        return <circle cx={half} cy={half} r={half - 5} {...commonProps} />;
      
      case 'diamond':
        // Points for diamond
        return <polygon points={`${half},5 ${size-5},${half} ${half},${size-5} 5,${half}`} {...commonProps} />;
      
      case 'hexagon':
        // Points for hexagon
        return <polygon points={`${half},5 ${size-5},${size*0.25} ${size-5},${size*0.75} ${half},${size-5} 5,${size*0.75} 5,${size*0.25}`} {...commonProps} />;
      
      case 'octagon':
        // Regular octagon (100px size)
        return <polygon points={`29,5 71,5 95,29 95,71 71,95 29,95 5,71 5,29`} {...commonProps} />;
      
      case 'square':
        return <rect x="10" y="10" width="80" height="80" rx="15" {...commonProps} />;
      
      case 'parallelogram':
        // Parallelogram shape for event nodes - more slanted, wider, less tall
        const skew = 30; // Increased horizontal skew for more slant and width
        const topY = 15; // Start higher (less tall)
        const bottomY = size - 15; // End higher (less tall)
        const leftX = -5; // Start beyond edge (wider)
        const rightX = size + 5; // End beyond edge (wider)
        return <polygon points={`${leftX + skew},${topY} ${rightX},${topY} ${rightX - skew},${bottomY} ${leftX},${bottomY}`} {...commonProps} />;
        
      default:
        return <rect x="10" y="10" width="80" height="80" {...commonProps} />;
    }
  };

  return (
    <div 
        className="absolute select-none group"
        style={{ 
            width: size, 
            height: size,
            transform: `translate(${node.position.x}px, ${node.position.y}px)`,
            cursor: 'grab'
        }}
        data-node-id={node.id}
    >
        {/* SVG Shape Layer */}
        <svg width={size} height={size} className="overflow-visible block">
            {renderShape()}

            {/* Operator Icon for Operation */}
            {node.type === 'operation' && (
                <text x="50%" y="50%" dy=".3em" textAnchor="middle" fill={nodeColor} fontSize="12" fontWeight="bold">
                    {node.label.split(' ')[0] || 'Op'}
                </text>
            )}
        </svg>

        {/* HTML Content Overlay (Labels, Ports) */}
        <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
            {/* Label styling based on node type */}
            {node.type !== 'operation' && (
                <div 
                    className={`text-center px-2 break-words w-full leading-tight`}
                    style={{ 
                        color: nodeColor,
                        fontSize: node.type === 'function' ? '11px' : node.type === 'state' ? '12px' : node.type === 'modifier' ? '12px' : node.type === 'condition' ? '11px' : node.type === 'event' ? '11px' : '10px',
                        fontWeight: node.type === 'function' ? '600' : 'bold',
                        letterSpacing: node.type === 'function' ? '0.02em' : '0',
                        textShadow: theme === 'dark' 
                            ? '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)' 
                            : '0 1px 2px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,0.5)',
                        lineHeight: '1.2',
                        maxWidth: node.type === 'modifier' ? '85%' : '90%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: node.type === 'modifier' ? 'flex' : '-webkit-box',
                        alignItems: node.type === 'modifier' ? 'center' : undefined,
                        justifyContent: node.type === 'modifier' ? 'center' : undefined,
                        WebkitLineClamp: node.type === 'function' ? 2 : node.type === 'modifier' ? 1 : 3,
                        WebkitBoxOrient: node.type === 'modifier' ? 'horizontal' : 'vertical',
                        textAlign: node.type === 'modifier' ? 'center' : undefined
                    }}
                >
                    {node.label}
                </div>
            )}
        </div>

        {/* Metadata Tooltip on Hover */}
        {node.value && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Value: {node.value}
            </div>
        )}

        {/* Connector Ports - Simple and Clear */}
        
        {/* State: Left input (for setting/updating), Right output (for reading) */}
        {node.type === 'state' && (
          <>
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={nodeColor} label="" />
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={nodeColor} label="" />
          </>
        )}

        {/* Function: Left input (modifiers), Right output (main flow) */}
        {node.type === 'function' && (
          <>
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={nodeColor} label="" />
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={nodeColor} label="" />
          </>
        )}

        {/* Operation: Left input, Right output */}
        {node.type === 'operation' && (
          <>
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={nodeColor} label="" />
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={nodeColor} label="" />
          </>
        )}

        {/* Modifier: Left input, Right output */}
        {node.type === 'modifier' && (
          <>
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={nodeColor} label="" />
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={nodeColor} label="" />
          </>
        )}

        {/* Event: Left and right ports on the slanted side edges */}
        {node.type === 'event' && (
          <>
            {/* Left slanted edge - positioned more outside */}
            {/* Left edge goes from (25, 15) to (-5, 85), moving port further left */}
            <Port cx={5} cy={half} type="input" nodeId={node.id} position="left" color={nodeColor} label="" />
            {/* Right slanted edge - positioned more outside */}
            {/* Right edge goes from (105, 15) to (75, 85), moving port further right */}
            <Port cx={95} cy={half} type="output" nodeId={node.id} position="right" color={nodeColor} label="" />
          </>
        )}
        
        {/* Condition: Left input, Right (T), Bottom (F) */}
        {isCondition && (
          <>
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={nodeColor} label="T" />
            <Port cx={half} cy={size} type="output" nodeId={node.id} position="bottom" color={nodeColor} label="F" />
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={nodeColor} label="" />
            <Port cx={half} cy={0} type="input" nodeId={node.id} position="top" color={nodeColor} label="" />
          </>
        )}

    </div>
  );
}

function Port({ cx, cy, type, nodeId, position, color, label = '' }: PortProps) {
    // Adjust port position to fit better on the edge - move inward
    const offset = 3; // Move ports slightly inward from the edge
    let adjustedCx = cx;
    let adjustedCy = cy;
    
    if (position === 'left') adjustedCx = cx + offset; // Move right (inward)
    if (position === 'right') adjustedCx = cx - offset; // Move left (inward)
    if (position === 'top') adjustedCy = cy + offset; // Move down (inward)
    if (position === 'bottom') adjustedCy = cy - offset; // Move up (inward)
    
    return (
        <div 
            className={`
                absolute w-4 h-4 -ml-2 -mt-2 rounded-full z-20 flex items-center justify-center
                cursor-crosshair group/port
            `}
            style={{ left: adjustedCx, top: adjustedCy }}
            data-port-id={`${nodeId}:${position}`}
            data-port-type={type}
        >
            {/* Visual Dot - matches condition node style with border and glow */}
            <div 
                className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 group-hover/port:scale-150 group-hover/port:shadow-lg`}
                style={{ 
                    backgroundColor: color,
                    borderColor: color,
                    boxShadow: `0 0 4px ${color}`
                }}
            />
            
            {/* Label for True/False ports */}
            {label && (
                <div className="absolute text-[9px] font-bold text-white pointer-events-none z-10" style={{ 
                    top: position === 'bottom' ? 14 : -4, 
                    left: position === 'right' ? 14 : -4,
                    textShadow: '0 0 4px rgba(0,0,0,0.8)'
                }}>
                    {label}
                </div>
            )}
        </div>
    );
}