"use client"

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'

export interface DocumentNodeData extends Record<string, unknown> {
  id: string
  documentId: string
  title: string
  description: string
  thumbnailUrl?: string
  images?: string[]
  documentUrl?: string
  isLetter?: boolean
  isHTML?: boolean
  onDelete?: (id: string) => void
  onReview?: (documentId: string) => void
}

function DocumentNodeComponent({ data, selected }: NodeProps) {
  const docData = data as DocumentNodeData
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (docData.onDelete) {
      docData.onDelete(docData.id)
    }
  }

  const handleClick = () => {
    if (docData.onReview) {
      docData.onReview(docData.documentId)
    }
  }

  return (
    <div
      className="group relative bg-white shadow-lg transition-all duration-200"
      style={{
        width: '100%',
        height: '100%',
        padding: '8px',
        boxShadow: selected
          ? '0 8px 16px rgba(0,0,0,0.4)'
          : '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      
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
              bottom: '-4px',
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
              left: '-4px',
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
              right: '-4px',
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
        title="Delete document"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {/* Document Content */}
      <div
        className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer flex items-center justify-center"
        style={{ zIndex: 1 }}
        onClick={handleClick}
      >
        {/* Background thumbnail (optional, subtle) */}
        {docData.thumbnailUrl && (
          <div className="absolute inset-0 opacity-5">
            <Image
              src={docData.thumbnailUrl}
              alt={docData.title}
              fill
              className="object-cover"
              sizes="250px"
            />
          </div>
        )}

        {/* Document text - centered */}
        <div className="relative flex items-center justify-center p-4 w-full h-full">
          <p className="text-sm font-bold text-gray-800 text-center font-mono leading-tight break-words">
            Document: {docData.title}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition-opacity" />
      </div>
    </div>
  )
}

export default memo(DocumentNodeComponent)
