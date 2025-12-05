import React from 'react';

// Colors
const COLORS = {
  neonGreen: '#00ff7f',
  neonYellow: '#ffee58',
  black: '#000000'
};

const NODE_STYLES = {
  state: {
    shape: 'circle',
    color: COLORS.neonGreen,
    glow: `0 0 15px ${COLORS.neonGreen}66`
  },
  condition: {
    shape: 'diamond',
    color: COLORS.neonYellow,
    glow: `0 0 15px ${COLORS.neonYellow}66`
  },
  function: {
    shape: 'hexagon',
    color: COLORS.neonGreen,
    strokeWidth: 2,
    glow: `0 0 10px ${COLORS.neonGreen}44`
  },
  operation: {
    shape: 'square',
    color: COLORS.neonGreen,
    glow: `0 0 10px ${COLORS.neonGreen}44`
  },
  modifier: {
    shape: 'octagon',
    color: COLORS.neonYellow,
    glow: `0 0 10px ${COLORS.neonYellow}44`
  },
  event: {
    shape: 'triangle',
    color: COLORS.neonYellow,
    glow: `0 0 10px ${COLORS.neonYellow}44`
  }
};

export default function ShapeNode({ node, isSelected, scale = 1 }) {
  const style = NODE_STYLES[node.type] || NODE_STYLES.state;
  
  // Modifiers are smaller as per requirements
  const size = node.type === 'modifier' ? 70 : 100; 
  const half = size / 2;
  
  const isModifier = node.type === 'modifier';
  const isCondition = node.type === 'condition';

  // Determine Shape Path
  const renderShape = () => {
    const stroke = style.color;
    const fill = '#000000';
    const strokeWidth = isSelected ? 3 : (style.strokeWidth || 1.5);
    const filter = isSelected ? `drop-shadow(${style.glow})` : 'none';
    
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
        // Approximation for octagon
        const p = 29; // inset point
        return <polygon points={`29,5 71,5 95,29 95,71 71,95 29,95 5,71 5,29`} {...commonProps} />;
      
      case 'square':
        return <rect x="10" y="10" width="80" height="80" rx="15" {...commonProps} />;
      
      case 'triangle':
        // Triangle pointing right
        return <polygon points={`20,10 80,${half} 20,90`} {...commonProps} />;
        
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
                <text x="50%" y="50%" dy=".3em" textAnchor="middle" fill={style.color} fontSize="24" fontWeight="bold">
                    {node.label.split(' ')[0] || 'Op'}
                </text>
            )}
        </svg>

        {/* HTML Content Overlay (Labels, Ports) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Label styling based on node type */}
            {node.type !== 'operation' && (
                <div 
                    className={`text-center px-2 break-words w-full leading-tight`}
                    style={{ 
                        color: style.color,
                        fontSize: node.type === 'function' ? '9px' : node.type === 'state' ? '10px' : '9px',
                        fontWeight: node.type === 'function' ? '600' : 'bold',
                        letterSpacing: node.type === 'function' ? '0.02em' : '0',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
                        lineHeight: '1.2',
                        maxWidth: '90%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: node.type === 'function' ? 2 : 3,
                        WebkitBoxOrient: 'vertical'
                    }}
                >
                    {node.label}
                </div>
            )}
        </div>

        {/* Metadata Tooltip on Hover */}
        {node.value && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Value: {node.value}
            </div>
        )}

        {/* Connector Ports - Simple and Clear */}
        
        {/* State: Right output only */}
        {node.type === 'state' && (
          <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={style.color} />
        )}

        {/* Function: Left input (modifiers), Right output (main flow) */}
        {node.type === 'function' && (
          <>
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={style.color} />
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={style.color} />
          </>
        )}

        {/* Operation: Left input, Right output */}
        {node.type === 'operation' && (
          <>
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={style.color} />
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={style.color} />
          </>
        )}

        {/* Modifier: Bottom output to function */}
        {node.type === 'modifier' && (
          <Port cx={half} cy={size} type="output" nodeId={node.id} position="bottom" color={style.color} />
        )}

        {/* Event: Left input only */}
        {node.type === 'event' && (
          <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={style.color} />
        )}
        
        {/* Condition: Left input, Right (T), Bottom (F) */}
        {isCondition && (
          <>
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={style.color} label="T" />
            <Port cx={half} cy={size} type="output" nodeId={node.id} position="bottom" color={style.color} label="F" />
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={style.color} />
          </>
        )}
        
        {/* Diamond/Condition Specific Ports (True/False) */}
        {isCondition && (
          <>
            <Port cx={size} cy={half} type="output" nodeId={node.id} position="right" color={style.color} label="T" />
            <Port cx={half} cy={size} type="output" nodeId={node.id} position="bottom" color={style.color} label="F" />
            <Port cx={0} cy={half} type="input" nodeId={node.id} position="left" color={style.color} />
            <Port cx={half} cy={0} type="input" nodeId={node.id} position="top" color={style.color} />
          </>
        )}

    </div>
  );
}

function Port({ cx, cy, type, nodeId, position, color, label }) {
    return (
        <div 
            className={`
                absolute w-4 h-4 -ml-2 -mt-2 rounded-full z-20 flex items-center justify-center
                cursor-crosshair group/port
            `}
            style={{ left: cx, top: cy }}
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