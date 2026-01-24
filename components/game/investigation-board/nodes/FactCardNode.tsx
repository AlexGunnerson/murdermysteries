"use client"

import { memo, useState } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { FactNodeData } from '../types'

interface FactCardNodeProps {
  data: FactNodeData
  selected?: boolean
}

function FactCardNode({ data, selected }: FactCardNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <>
      <NodeResizer
        minWidth={180}
        minHeight={100}
        isVisible={selected}
        lineClassName="border-amber-600"
        handleClassName="h-3 w-3 bg-amber-600 border border-amber-800"
      />
      
      {/* Connection handles - visible only when selected */}
      {/* Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-3 !h-3 !bg-transparent !border-0 transition-opacity !rounded-full"
        style={{ 
          opacity: selected ? 1 : 0,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.6)' : 'none'
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-3 !h-3 !bg-transparent !border-0 transition-opacity !rounded-full"
        style={{ 
          opacity: selected ? 1 : 0,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.6)' : 'none'
        }}
      />
      
      {/* Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-3 !h-3 !bg-transparent !border-0 transition-opacity !rounded-full"
        style={{ 
          opacity: selected ? 1 : 0,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.6)' : 'none'
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-3 !h-3 !bg-transparent !border-0 transition-opacity !rounded-full"
        style={{ 
          opacity: selected ? 1 : 0,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.6)' : 'none'
        }}
      />
      
      {/* Left */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-3 !h-3 !bg-transparent !border-0 transition-opacity !rounded-full"
        style={{ 
          opacity: selected ? 1 : 0,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.6)' : 'none'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-3 !h-3 !bg-transparent !border-0 transition-opacity !rounded-full"
        style={{ 
          opacity: selected ? 1 : 0,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.6)' : 'none'
        }}
      />
      
      {/* Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-3 !h-3 !bg-transparent !border-0 transition-opacity !rounded-full"
        style={{ 
          opacity: selected ? 1 : 0,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.6)' : 'none'
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-3 !h-3 !bg-transparent !border-0 transition-opacity !rounded-full"
        style={{ 
          opacity: selected ? 1 : 0,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.6)' : 'none'
        }}
      />
      
      {/* Index Card */}
      <div
        className={`
          relative min-w-[180px] min-h-[100px] p-3
          transition-all duration-200
          ${selected ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-transparent' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fde68a 100%)',
          boxShadow: isHovered 
            ? '0 8px 20px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
            : '0 4px 12px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
          transform: `rotate(${(data.id.charCodeAt(0) % 5) - 2}deg)`,
          borderRadius: '2px',
          border: '1px solid #d4a574',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Paper texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Horizontal lines like index card */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-blue-200/40"
              style={{ top: `${24 + i * 16}px` }}
            />
          ))}
        </div>
        
        {/* Red margin line */}
        <div 
          className="absolute top-0 bottom-0 left-8 w-px bg-red-300/60"
        />
        
        {/* Content */}
        <div className="relative z-10 pl-4">
          {/* Summary/Title - always visible */}
          <p 
            className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            {data.summary}
          </p>
          
          {/* Full content - shown on hover or if short */}
          <p 
            className={`
              text-xs text-gray-800 leading-relaxed
              transition-all duration-200
              ${isHovered ? 'opacity-100 max-h-48' : 'opacity-70 max-h-12 overflow-hidden'}
            `}
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            {data.content}
          </p>
          
          {/* Source */}
          <div className="mt-2 pt-1 border-t border-gray-400/30">
            <p 
              className="text-[10px] text-gray-600 italic"
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            >
              Source: {data.friendlySourceName}
            </p>
          </div>
        </div>
      </div>
      
      {/* Hover tooltip for full content */}
      {isHovered && data.content.length > 100 && (
        <div 
          className="absolute left-full ml-2 top-0 z-50 max-w-xs p-3 rounded shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #d4af37',
          }}
        >
          <p 
            className="text-xs text-gray-200 leading-relaxed"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            {data.content}
          </p>
        </div>
      )}
    </>
  )
}

export default memo(FactCardNode)
