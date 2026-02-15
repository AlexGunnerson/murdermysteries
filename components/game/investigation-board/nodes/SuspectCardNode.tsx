"use client"

import { memo } from 'react'
import React from 'react'
import { Handle, Position } from '@xyflow/react'
import Image from 'next/image'
import { SuspectNodeData } from '../types'

interface SuspectCardNodeProps {
  data: SuspectNodeData & {
    isConnecting?: boolean
  }
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
  
  const showConnectionDots = selected || data.isConnecting

  return (
    <>
      {/* Connection handles - DEV MODE: Source handles for easy dragging, tiny target handles + connectionRadius for snap detection */}
      {/* Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{ 
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: 'none',
          pointerEvents: data.isConnecting ? 'none' : 'auto',
          zIndex: 1,
          transform: 'translate(-50%, -50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{ 
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(239, 68, 68, 1)',
          border: 'none',
          pointerEvents: 'auto',
          zIndex: 10,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{ 
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: 'none',
          pointerEvents: data.isConnecting ? 'none' : 'auto',
          zIndex: 1,
          transform: 'translate(-50%, 50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{ 
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(239, 68, 68, 1)',
          border: 'none',
          pointerEvents: 'auto',
          zIndex: 10,
          transform: 'translate(-50%, 50%)'
        }}
      />
      
      {/* Left */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{ 
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: 'none',
          pointerEvents: data.isConnecting ? 'none' : 'auto',
          zIndex: 1,
          transform: 'translate(-50%, -50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ 
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(239, 68, 68, 1)',
          border: 'none',
          pointerEvents: 'auto',
          zIndex: 10,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{ 
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: 'none',
          pointerEvents: data.isConnecting ? 'none' : 'auto',
          zIndex: 1,
          transform: 'translate(50%, -50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{ 
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          opacity: 0,
          backgroundColor: 'rgba(239, 68, 68, 1)',
          border: 'none',
          pointerEvents: 'auto',
          zIndex: 10,
          transform: 'translate(50%, -50%)'
        }}
      />
      
      {/* DEBUG: Connection radius visualization (50px snap zone) - hidden but kept for debugging */}
      <>
        {/* Top snap zone */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '0',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            background: 'rgba(59, 130, 246, 0)',
            border: '2px dashed rgba(59, 130, 246, 0)',
            borderRadius: '50%',
            zIndex: 5,
            display: 'none',
          }}
        />
        
        {/* Bottom snap zone */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '0',
            left: '50%',
            transform: 'translate(-50%, 50%)',
            width: '100px',
            height: '100px',
            background: 'rgba(59, 130, 246, 0)',
            border: '2px dashed rgba(59, 130, 246, 0)',
            borderRadius: '50%',
            zIndex: 5,
            display: 'none',
          }}
        />
        
        {/* Left snap zone */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '0',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            background: 'rgba(59, 130, 246, 0)',
            border: '2px dashed rgba(59, 130, 246, 0)',
            borderRadius: '50%',
            zIndex: 5,
            display: 'none',
          }}
        />
        
        {/* Right snap zone */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: '0',
            top: '50%',
            transform: 'translate(50%, -50%)',
            width: '100px',
            height: '100px',
            background: 'rgba(59, 130, 246, 0)',
            border: '2px dashed rgba(59, 130, 246, 0)',
            borderRadius: '50%',
            zIndex: 5,
            display: 'none',
          }}
        />
      </>
      
      {/* Custom visual dots at midpoints - visible when selected or near connection */}
      {showConnectionDots && (
        <>
          {/* Top dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '8px',
              height: '8px',
              background: '#9CA3AF',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* Bottom dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '8px',
              height: '8px',
              background: '#9CA3AF',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* Left dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              background: '#9CA3AF',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* Right dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              right: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              background: '#9CA3AF',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
        </>
      )}
      
      {/* Portrait Card - Polaroid style */}
      <div
        className={`
          relative bg-white p-2 pb-8
          transition-all duration-200 hover:scale-105
          ${selected ? 'ring-2 ring-offset-2 ring-offset-transparent ring-gray-400' : ''}
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
          className="relative overflow-hidden"
          style={{
            width: '150px',
            height: '175px',
            filter: 'sepia(20%) contrast(1.1)',
          }}
        >
          <Image
            src={data.portraitUrl}
            alt={data.name}
            fill
            className="object-cover"
            sizes="150px"
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
