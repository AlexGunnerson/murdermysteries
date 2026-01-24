"use client"

import { memo } from 'react'
import React from 'react'
import { Handle, Position } from '@xyflow/react'
import Image from 'next/image'
import { SuspectNodeData } from '../types'

interface SuspectCardNodeProps {
  data: SuspectNodeData
  selected?: boolean
}

function SuspectCardNode({ data, selected }: SuspectCardNodeProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const isVictim = data.isVictim
  
  // Extract first name or handle special cases like "Dr. Vale"
  const getDisplayName = (fullName: string): string => {
    // Special case for Dr. Vale
    if (fullName.toLowerCase().includes('vale')) {
      return 'Dr. Vale'
    }
    // Get first name (first word)
    return fullName.split(' ')[0]
  }
  
  const displayName = getDisplayName(data.name)
  
  return (
    <>
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
      
      {/* Portrait Card - Polaroid style */}
      <div
        className={`
          relative bg-white p-2 pb-8
          transition-all duration-200 hover:scale-105
          ${selected ? 'ring-2 ring-offset-2 ring-offset-transparent ring-amber-500' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          boxShadow: '0 6px 20px rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.15)',
          transform: `rotate(${(data.id.charCodeAt(0) % 7) - 3}deg)`,
          minWidth: '100px',
        }}
      >
        {/* Photo */}
        <div 
          className="relative w-24 h-28 overflow-hidden"
          style={{
            filter: 'sepia(20%) contrast(1.1)',
          }}
        >
          <Image
            src={data.portraitUrl}
            alt={data.name}
            fill
            className="object-cover"
            sizes="96px"
          />
          
          {/* Vintage photo overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,248,220,0.1) 0%, transparent 50%, rgba(139,90,43,0.1) 100%)',
            }}
          />
        </div>
        
        {/* Name label */}
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <p 
            className="text-sm font-bold tracking-wide text-gray-800"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
          >
            {displayName}
          </p>
        </div>
        
        {/* Corner wear effect */}
        <div 
          className="absolute top-0 right-0 w-4 h-4"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)',
          }}
        />
      </div>
    </>
  )
}

export default memo(SuspectCardNode)
