import React, { useRef, useState, useEffect, useCallback } from 'react';
import ShapeNode from './ShapeNode';

// Constants
const GRID_SIZE = 20; // 10px grid for snapping, visual 20px
const SNAP_SIZE = 10;

export default function Canvas({ 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onSelectNode, 
    selectedNodeId,
    onConnect,
    onViewChange,
    onDrop,
    onDragOver
}) {
    const containerRef = useRef(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

    // Report view change
    useEffect(() => {
        if (onViewChange) onViewChange(transform);
    }, [transform, onViewChange]);
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Node Dragging State
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });
    
    // Connection Dragging State
    const [connecting, setConnecting] = useState(null); // { nodeId, portPosition, startX, startY }
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // --- Helpers ---
    const screenToWorld = (sx, sy) => ({
        x: (sx - transform.x) / transform.k,
        y: (sy - transform.y) / transform.k
    });

    const snapToGrid = (val) => Math.round(val / SNAP_SIZE) * SNAP_SIZE;

    // --- Zoom / Pan ---
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomIntensity = 0.1;
            const direction = e.deltaY > 0 ? -1 : 1;
            const factor = 1 + (direction * zoomIntensity);
            
            // Calculate zoom pivot
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const newK = Math.min(Math.max(0.2, transform.k * factor), 4);
            const newX = mouseX - (mouseX - transform.x) * (newK / transform.k);
            const newY = mouseY - (mouseY - transform.y) * (newK / transform.k);
            
            setTransform({ x: newX, y: newY, k: newK });
        } else {
            // Pan
            setTransform(prev => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
        }
    };

    const handleMouseDown = (e) => {
        // Middle mouse or Space+Click to pan
        if (e.button === 1 || (e.button === 0 && e.target === containerRef.current)) {
            setIsDraggingCanvas(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            return;
        }

        // Check for Port Click (Start Connection)
        const port = e.target.closest('[data-port-id]');
        if (port) {
            e.stopPropagation();
            const portId = port.getAttribute('data-port-id');
            const portType = port.getAttribute('data-port-type');
            const [nodeId, position] = portId.split(':');
            
            // Only start dragging from output ports for now (simplified)
            if (portType === 'output') {
                const rect = containerRef.current.getBoundingClientRect();
                const worldPos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
                
                // Snap start position to node port exact location
                const node = nodes.find(n => n.id === nodeId);
                const portOffset = getPortOffset(position);
                const startX = node.position.x + portOffset.x;
                const startY = node.position.y + portOffset.y;

                setConnecting({ nodeId, portId, startX, startY });
                setMousePos({ x: startX, y: startY }); // Initialize mousePos
            }
            return;
        }

        // Check for Node Click (Start Drag or Select)
        const nodeEl = e.target.closest('[data-node-id]');
        if (nodeEl) {
            const id = nodeEl.getAttribute('data-node-id');
            onSelectNode(id);
            setDraggingNodeId(id);
            
            // Calculate offset within node
            const rect = containerRef.current.getBoundingClientRect();
            const worldPos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
            const node = nodes.find(n => n.id === id);
            setNodeDragStart({ 
                x: worldPos.x - node.position.x, 
                y: worldPos.y - node.position.y 
            });
        } else {
            onSelectNode(null);
        }
    };

    const handleMouseMove = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        
        // Pan Canvas
        if (isDraggingCanvas) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            setDragStart({ x: e.clientX, y: e.clientY });
            return;
        }

        // Drag Connection
        if (connecting) {
             const worldPos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
             setMousePos(worldPos);
        }

        // Drag Node
        if (draggingNodeId) {
            const worldPos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
            const newX = snapToGrid(worldPos.x - nodeDragStart.x);
            const newY = snapToGrid(worldPos.y - nodeDragStart.y);
            
            onNodesChange(nodes.map(n => n.id === draggingNodeId ? { ...n, position: { x: newX, y: newY } } : n));
        }
    };

    const handleMouseUp = (e) => {
        setIsDraggingCanvas(false);
        setDraggingNodeId(null);
        
        // Finish Connection
        if (connecting) {
            const port = e.target.closest('[data-port-id]');
            if (port) {
                const targetPortId = port.getAttribute('data-port-id');
                const targetPortType = port.getAttribute('data-port-type');
                
                // Valid connection: Output -> Input, different nodes
                if (targetPortType === 'input' && !targetPortId.startsWith(connecting.nodeId)) {
                    onConnect(connecting.portId, targetPortId);
                }
            }
            setConnecting(null);
        }
    };

    // --- Rendering Helpers ---
    const getPortOffset = (pos) => {
        const size = 100;
        const half = 50;
        if (pos === 'top') return { x: half, y: 0 };
        if (pos === 'bottom') return { x: half, y: size };
        if (pos === 'left') return { x: 0, y: half };
        if (pos === 'right') return { x: size, y: half };
        return { x: half, y: half };
    };

    const getNodePortPosition = (nodeId, portPos) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        const offset = getPortOffset(portPos);
        return { x: node.position.x + offset.x, y: node.position.y + offset.y };
    };

    // --- Drag & Drop Handlers ---
    const handleDropInternal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDrop) {
            // Calculate world coordinates from screen coordinates
            const rect = containerRef.current.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            
            // Node size is 100px, so center offset is 50px
            const NODE_SIZE = 100;
            const NODE_CENTER_OFFSET = NODE_SIZE / 2;
            
            // Adjust coordinates so cursor is at center of node
            const worldX = (screenX - transform.x) / transform.k - NODE_CENTER_OFFSET;
            const worldY = (screenY - transform.y) / transform.k - NODE_CENTER_OFFSET;
            
            // Create a synthetic event with world coordinates, preserving the original event methods
            const syntheticEvent = {
                ...e,
                worldX,
                worldY,
                transform,
                preventDefault: () => e.preventDefault(),
                stopPropagation: () => e.stopPropagation(),
                dataTransfer: e.dataTransfer
            };
            onDrop(syntheticEvent);
        }
    };

    const handleDragOverInternal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDragOver) {
            onDragOver(e);
        } else {
            e.dataTransfer.dropEffect = 'move';
        }
    };

    // --- Render ---
    return (
        <div 
            ref={containerRef}
            className="w-full h-full bg-black relative overflow-hidden cursor-default select-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDrop={handleDropInternal}
            onDragOver={handleDragOverInternal}
        >
            {/* Grid Background */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                    backgroundSize: `${GRID_SIZE * transform.k}px ${GRID_SIZE * transform.k}px`,
                    backgroundPosition: `${transform.x}px ${transform.y}px`
                }}
            />

            {/* World Container */}
            <div 
                className="absolute top-0 left-0 origin-top-left w-full h-full"
                style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}
            >
                {/* Edges Layer (SVG) */}
                <svg className="overflow-visible absolute inset-0 pointer-events-none z-0">
                    {edges.map((edge, i) => {
                        const [sourceId, sourcePos] = edge.from.split(':');
                        const [targetId, targetPos] = edge.to.split(':');
                        const start = getNodePortPosition(sourceId, sourcePos);
                        const end = getNodePortPosition(targetId, targetPos);
                        
                        // Basic Curve
                        const dx = Math.abs(end.x - start.x);
                        const controlX = dx * 0.5;
                        const path = `M ${start.x} ${start.y} C ${start.x + controlX} ${start.y}, ${end.x - controlX} ${end.y}, ${end.x} ${end.y}`;
                        
                        return (
                            <path 
                                key={edge.id || i}
                                d={path}
                                stroke="#00ff7f"
                                strokeWidth="2"
                                fill="none"
                                className="transition-all duration-300 opacity-60"
                                style={{ filter: 'drop-shadow(0 0 2px #00ff7f)' }}
                            />
                        );
                    })}
                    
                    {/* Temporary Connection Line */}
                    {connecting && (
                         <path 
                            d={`M ${connecting.startX} ${connecting.startY} C ${connecting.startX + 50} ${connecting.startY}, ${mousePos.x - 50} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                            stroke="#ffee58"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            fill="none"
                            className="animate-pulse"
                        />
                    )}
                </svg>

                {/* Nodes Layer */}
                {nodes.map(node => (
                    <ShapeNode 
                        key={node.id} 
                        node={node} 
                        isSelected={selectedNodeId === node.id}
                    />
                ))}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-black/50 backdrop-blur p-2 rounded border border-white/10">
                <div className="text-xs text-gray-400 font-mono">
                    Zoom: {Math.round(transform.k * 100)}%
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                    Mid-Click: Pan<br/>Ctrl+Scroll: Zoom
                </div>
            </div>
        </div>
    );
}