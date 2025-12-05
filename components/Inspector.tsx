'use client';

import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Inspector({ selectedNode, onUpdateNode, onDeleteNode, onClose }) {
  if (!selectedNode) return null;

  const handleChange = (field, value) => {
    onUpdateNode(selectedNode.id, { [field]: value });
  };

  const handleMetadataChange = (field, value) => {
    onUpdateNode(selectedNode.id, { 
      metadata: { ...selectedNode.metadata, [field]: value } 
    });
  };

  const getNodeColor = (type) => {
    if (['state', 'function', 'operation'].includes(type)) return '#00ff7f'; // Neon Green
    return '#ffee58'; // Neon Yellow
  };

  const color = getNodeColor(selectedNode.type);

  return (
    <div className="w-80 bg-black border-l border-white/10 flex flex-col h-full z-30 shadow-xl absolute right-0 top-0 bottom-0">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: color, color: color }} 
          />
          <h2 className="font-bold text-sm uppercase tracking-wider text-white">
            {selectedNode.type} Node
          </h2>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        <div className="space-y-3">
          <Label className="text-xs text-gray-400 uppercase font-bold">Node Label</Label>
          <Input 
            value={selectedNode.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="bg-black border-white/20 focus:border-neon-yellow text-white font-medium"
            placeholder="Enter label..."
          />
        </div>

        {/* Dynamic Fields based on Type */}
        {selectedNode.type === 'state' && (
          <div className="space-y-3">
             <Label className="text-xs text-gray-400 uppercase font-bold">Data Type</Label>
             <Select 
                value={selectedNode.metadata?.dataType || 'uint256'} 
                onValueChange={(v) => handleMetadataChange('dataType', v)}
             >
                <SelectTrigger className="bg-black border-white/20 text-white">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="uint256">uint256</SelectItem>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="address">address</SelectItem>
                    <SelectItem value="bool">bool</SelectItem>
                </SelectContent>
             </Select>

             <Label className="text-xs text-gray-400 uppercase font-bold">Initial Value</Label>
             <Input 
                value={selectedNode.value || ''}
                onChange={(e) => handleChange('value', e.target.value)}
                className="bg-black border-white/20 text-white font-mono"
                placeholder="0x..."
             />
             <Label className="text-xs text-gray-400 uppercase font-bold">Visibility</Label>
             <Select 
                value={selectedNode.metadata?.visibility || 'public'} 
                onValueChange={(v) => handleMetadataChange('visibility', v)}
             >
                <SelectTrigger className="bg-black border-white/20 text-white">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
             </Select>
          </div>
        )}

        {selectedNode.type === 'condition' && (
             <div className="space-y-3">
                <Label className="text-xs text-gray-400 uppercase font-bold">Condition Expression</Label>
                <Textarea 
                    value={selectedNode.metadata?.expression || ''}
                    onChange={(e) => handleMetadataChange('expression', e.target.value)}
                    className="bg-black border-white/20 text-white font-mono text-xs h-24"
                    placeholder="msg.sender == owner"
                />
             </div>
        )}

        {selectedNode.type === 'function' && (
            <div className="space-y-3">
                <Label className="text-xs text-gray-400 uppercase font-bold">Parameters</Label>
                <Input 
                    value={selectedNode.metadata?.params || ''}
                    onChange={(e) => handleMetadataChange('params', e.target.value)}
                    className="bg-black border-white/20 text-white font-mono text-xs"
                    placeholder="address to, uint256 amount"
                />
                <Label className="text-xs text-gray-400 uppercase font-bold">Visibility</Label>
                <Select 
                    value={selectedNode.metadata?.visibility || 'public'} 
                    onValueChange={(v) => handleMetadataChange('visibility', v)}
                >
                    <SelectTrigger className="bg-black border-white/20 text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-2 pt-2">
                    <input 
                        type="checkbox" 
                        checked={selectedNode.metadata?.payable || false}
                        onChange={(e) => handleMetadataChange('payable', e.target.checked)}
                        className="rounded border-gray-600 bg-black text-neon-yellow focus:ring-neon-yellow"
                    />
                    <span className="text-sm text-gray-300">Payable</span>
                </div>
            </div>
        )}

        {selectedNode.type === 'operation' && (
            <div className="space-y-3">
                <Label className="text-xs text-gray-400 uppercase font-bold">Operation Expression</Label>
                <Textarea 
                    value={selectedNode.value || ''}
                    onChange={(e) => handleChange('value', e.target.value)}
                    className="bg-black border-white/20 text-white font-mono text-xs h-24"
                    placeholder="balance += amount;"
                />
                <p className="text-xs text-gray-500">Enter Solidity code for this operation</p>
            </div>
        )}

        {selectedNode.type === 'modifier' && (
            <div className="space-y-3">
                <Label className="text-xs text-gray-400 uppercase font-bold">Access Condition</Label>
                <Textarea 
                    value={selectedNode.metadata?.expression || ''}
                    onChange={(e) => handleMetadataChange('expression', e.target.value)}
                    className="bg-black border-white/20 text-white font-mono text-xs h-24"
                    placeholder="msg.sender == owner"
                />
                <p className="text-xs text-gray-500">Boolean expression for access control</p>
            </div>
        )}

        {selectedNode.type === 'event' && (
            <div className="space-y-3">
                <Label className="text-xs text-gray-400 uppercase font-bold">Event Parameters</Label>
                <Input 
                    value={selectedNode.metadata?.params || ''}
                    onChange={(e) => handleMetadataChange('params', e.target.value)}
                    className="bg-black border-white/20 text-white font-mono text-xs"
                    placeholder="address indexed from, uint256 amount"
                />
                <p className="text-xs text-gray-500">Define event parameters</p>
            </div>
        )}

        <div className="pt-4 border-t border-white/10">
            <div className="text-xs text-gray-500 font-mono mb-4">
                ID: {selectedNode.id}<br/>
                X: {Math.round(selectedNode.position.x)} Y: {Math.round(selectedNode.position.y)}
            </div>
            <Button 
                variant="destructive" 
                className="w-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                onClick={() => onDeleteNode(selectedNode.id)}
            >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Node
            </Button>
        </div>
      </div>
    </div>
  );
}