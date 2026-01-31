"use client"

import { memo } from 'react'
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'

export interface PhotoNodeData extends Record<string, unknown> {
  id: string
  imageUrl: string
  title: string
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

function PhotoNodeComponent({ data, selected }: NodeProps) {
  const photoData = data as PhotoNodeData
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (photoData.onDelete) {
      photoData.onDelete(photoData.id)
    }
  }

  const handleClick = () => {
    if (photoData.onClick) {
      photoData.onClick(photoData.id)
    }
  }

  return (
    <div
      className="group relative bg-white shadow-lg transition-all duration-200"
      style={{
        width: '100%',
        height: '100%',
        padding: '6px',
        boxShadow: selected
          ? '0 8px 16px rgba(0,0,0,0.4)'
          : '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      {/* Node Resizer - only show when selected */}
      {selected && (
        <NodeResizer
          minWidth={150}
          minHeight={150}
          isVisible={selected}
          lineClassName="border-gray-400"
          handleClassName="h-3 w-3 bg-white border-2 border-gray-400 rounded"
        />
      )}
      
      {/* Connection handles - invisible but functional */}
      {/* Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-8 !h-8 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-8 !h-8 !bg-transparent !border-0 !rounded-full"
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
        className="!w-8 !h-8 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-8 !h-8 !bg-transparent !border-0 !rounded-full"
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
        className="!w-8 !h-8 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-8 !h-8 !bg-transparent !border-0 !rounded-full"
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
        className="!w-8 !h-8 !bg-transparent !border-0 !rounded-full"
        style={{ 
          opacity: 0,
          pointerEvents: 'auto'
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-8 !h-8 !bg-transparent !border-0 !rounded-full"
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
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '8px',
              height: '8px',
              background: '#6b7280',
              border: '2px solid white',
              borderRadius: '50%',
              zIndex: 100,
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
              background: '#6b7280',
              border: '2px solid white',
              borderRadius: '50%',
              zIndex: 100,
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
              background: '#6b7280',
              border: '2px solid white',
              borderRadius: '50%',
              zIndex: 100,
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
              background: '#6b7280',
              border: '2px solid white',
              borderRadius: '50%',
              zIndex: 100,
            }}
          />
        </>
      )}

      {/* Delete Button - appears on hover */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
        style={{ zIndex: 100 }}
        title="Delete photo"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {/* Photo */}
      <div
        className="relative w-full h-full bg-gray-200 overflow-hidden cursor-pointer"
        style={{ zIndex: 1 }}
        onClick={handleClick}
      >
        <Image
          src={photoData.imageUrl}
          alt={photoData.title}
          fill
          className="object-cover hover:opacity-90 transition-opacity"
          sizes="200px"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity" />
      </div>

    </div>
  )
}

export default memo(PhotoNodeComponent)
