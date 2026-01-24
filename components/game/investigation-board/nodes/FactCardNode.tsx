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
      
      {/* Connection handles - invisible but functional */}
      {/* Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-3 !h-3 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-3 !h-3 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      
      {/* Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-3 !h-3 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-3 !h-3 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      
      {/* Left */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-3 !h-3 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-3 !h-3 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      
      {/* Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-3 !h-3 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-3 !h-3 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      
      {/* Custom visual dots at midpoints - only visible when selected */}
      {selected && (
        <>
          {/* Top dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '8px',
              height: '8px',
              background: '#3b82f6',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* Bottom dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '8px',
              height: '8px',
              background: '#3b82f6',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* Left dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              background: '#3b82f6',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* Right dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              background: '#3b82f6',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
        </>
      )}
      
      {/* Modern Silver Card */}
      <div
        className={`
          relative w-full h-full min-w-[180px] min-h-[100px] p-4 flex flex-col
          transition-all duration-200
          ${selected ? 'ring-2 ring-[#94a3b8]' : ''}
        `}
        style={{
          background: 'rgba(148, 163, 184, 0.15)',
          backdropFilter: 'blur(10px)',
          boxShadow: isHovered 
            ? '0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(148, 163, 184, 0.3)'
            : '0 4px 12px rgba(0,0,0,0.4), 0 0 10px rgba(148, 163, 184, 0.2)',
          borderRadius: '6px',
          border: '1px solid rgba(148, 163, 184, 0.4)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Content - flex-1 allows it to grow */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Full content - takes available space */}
          <div className="flex-1">
            <p 
              className="text-xs text-gray-300 leading-relaxed transition-all duration-200"
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            >
              {data.content}
            </p>
          </div>
          
          {/* Source - pinned at bottom with small margin */}
          <div className="mt-2 pt-2 border-t border-gray-600/30 flex-shrink-0">
            <p 
              className="text-[10px] text-gray-500 italic"
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            >
              Source: {data.friendlySourceName}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(FactCardNode)
