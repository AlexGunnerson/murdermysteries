"use client"

import { memo } from 'react'
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react'
import Image from 'next/image'

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
  isConnecting?: boolean
}

function DocumentNodeComponent({ data, selected }: NodeProps) {
  const docData = data as DocumentNodeData

  const handleClick = () => {
    if (docData.onReview) {
      docData.onReview(docData.documentId)
    }
  }

  const showConnectionDots = selected || docData.isConnecting

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
      {/* Node Resizer - only show when selected, aspect ratio locked to A4 */}
      {selected && (
        <NodeResizer
          minWidth={100}
          minHeight={141}
          isVisible={selected}
          keepAspectRatio={true}
          lineClassName="border-gray-400"
          handleClassName="h-3 w-3 bg-white border-2 border-gray-400 rounded"
        />
      )}
      
      {/* Connection handles - VISIBLE FOR DEVELOPMENT, same size for easier snapping */}
      {/* Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-8 !h-8 !rounded-full"
        style={{ 
          opacity: 0.3,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: '2px solid rgba(59, 130, 246, 0.8)',
          pointerEvents: docData.isConnecting ? 'none' : 'auto',
          zIndex: 1
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-8 !h-8 !rounded-full"
        style={{ 
          opacity: 0.3,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          border: '2px solid rgba(239, 68, 68, 0.8)',
          pointerEvents: docData.isConnecting ? 'none' : 'auto',
          zIndex: 10
        }}
      />
      
      {/* Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-8 !h-8 !rounded-full"
        style={{ 
          opacity: 0.3,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: '2px solid rgba(59, 130, 246, 0.8)',
          pointerEvents: docData.isConnecting ? 'none' : 'auto',
          zIndex: 1
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-8 !h-8 !rounded-full"
        style={{ 
          opacity: 0.3,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          border: '2px solid rgba(239, 68, 68, 0.8)',
          pointerEvents: docData.isConnecting ? 'none' : 'auto',
          zIndex: 10
        }}
      />
      
      {/* Left */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-8 !h-8 !rounded-full"
        style={{ 
          opacity: 0.3,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: '2px solid rgba(59, 130, 246, 0.8)',
          pointerEvents: docData.isConnecting ? 'none' : 'auto',
          zIndex: 1
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-8 !h-8 !rounded-full"
        style={{ 
          opacity: 0.3,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          border: '2px solid rgba(239, 68, 68, 0.8)',
          pointerEvents: docData.isConnecting ? 'none' : 'auto',
          zIndex: 10
        }}
      />
      
      {/* Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-8 !h-8 !rounded-full"
        style={{ 
          opacity: 0.3,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: '2px solid rgba(59, 130, 246, 0.8)',
          pointerEvents: docData.isConnecting ? 'none' : 'auto',
          zIndex: 1
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-8 !h-8 !rounded-full"
        style={{ 
          opacity: 0.3,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          border: '2px solid rgba(239, 68, 68, 0.8)',
          pointerEvents: docData.isConnecting ? 'none' : 'auto',
          zIndex: 10
        }}
      />
      
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
          <p className="text-sm text-gray-800 text-center font-mono leading-tight break-words">
            {docData.title}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition-opacity" />
      </div>
    </div>
  )
}

export default memo(DocumentNodeComponent)
