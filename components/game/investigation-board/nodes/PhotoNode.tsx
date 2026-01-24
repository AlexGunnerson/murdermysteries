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
      
      {/* Connection Handles - only show when selected */}
      {selected && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            style={{
              background: '#6b7280',
              width: '8px',
              height: '8px',
              border: '2px solid white',
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            style={{
              background: '#6b7280',
              width: '8px',
              height: '8px',
              border: '2px solid white',
            }}
          />
          <Handle
            type="source"
            position={Position.Left}
            style={{
              background: '#6b7280',
              width: '8px',
              height: '8px',
              border: '2px solid white',
            }}
          />
          <Handle
            type="source"
            position={Position.Right}
            style={{
              background: '#6b7280',
              width: '8px',
              height: '8px',
              border: '2px solid white',
            }}
          />
        </>
      )}

      {/* Delete Button - appears on hover */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
        title="Delete photo"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {/* Photo */}
      <div
        className="relative w-full h-full bg-gray-200 overflow-hidden cursor-pointer"
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
