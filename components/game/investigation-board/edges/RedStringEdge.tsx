"use client"

import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Position,
} from '@xyflow/react'
import { ConnectionType, CONNECTION_TYPES } from '../types'

interface RedStringEdgeData {
  connectionType: ConnectionType
  onContextMenu?: (event: React.MouseEvent, edgeId: string) => void
}

interface RedStringEdgeProps {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  data?: RedStringEdgeData
  selected?: boolean
}

function RedStringEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: RedStringEdgeProps) {
  const connectionType = data?.connectionType || 'supports'
  const typeConfig = CONNECTION_TYPES[connectionType]
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (data?.onContextMenu) {
      data.onContextMenu(event, id)
    }
  }

  return (
    <>
      {/* Red string effect with texture */}
      <defs>
        <filter id={`string-texture-${id}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        
        {/* Arrow marker */}
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="3"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path
            d="M 10 0 L 0 5 L 10 10 z"
            fill={typeConfig.color}
            stroke="none"
          />
        </marker>
        
        {/* Zero-offset invisible marker for line start (to position line close to node) */}
        <marker
          id={`start-${id}`}
          viewBox="0 0 10 10"
          refX="0"
          refY="5"
          markerWidth="0"
          markerHeight="0"
        >
          <circle
            cx="5"
            cy="5"
            r="0"
            fill="transparent"
          />
        </marker>
      </defs>
      
      {/* Shadow/glow layer for depth */}
      <path
        d={edgePath}
        fill="none"
        stroke={typeConfig.color}
        strokeWidth={8}
        opacity={0.2}
        style={{
          filter: 'blur(4px)',
        }}
      />
      
      {/* Main line - colored by connection type */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: typeConfig.color,
          strokeWidth: selected ? 3 : 2,
          strokeLinecap: 'round',
          cursor: 'pointer',
        }}
        markerStart={`url(#arrow-${id})`}
      />
      
      {/* Highlight when selected */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#9CA3AF"
          strokeWidth={6}
          opacity={0.4}
        />
      )}
      
      {/* Endpoint dots when selected - for reconnection (invisible) */}
      {selected && (
        <>
          {/* Source endpoint dot */}
          <circle
            cx={sourceX}
            cy={sourceY}
            r={3}
            fill="transparent"
            stroke="transparent"
            strokeWidth={1}
            style={{
              cursor: 'pointer',
              pointerEvents: 'all',
            }}
          />
          
          {/* Target endpoint dot */}
          <circle
            cx={targetX}
            cy={targetY}
            r={3}
            fill="transparent"
            stroke="transparent"
            strokeWidth={1}
            style={{
              cursor: 'pointer',
              pointerEvents: 'all',
            }}
          />
        </>
      )}
      
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onContextMenu={handleContextMenu}
      />
      
      {/* Connection type label */}
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onContextMenu={handleContextMenu}
        >
          {/* Label card */}
          <div
            className={`
              px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide
              cursor-context-menu
              transition-all duration-200
              ${selected ? 'ring-2 ring-gray-400' : ''}
            `}
            style={{
              backgroundColor: typeConfig.bgColor,
              color: typeConfig.color,
              fontFamily: "'Courier Prime', 'Courier New', monospace",
              border: `1px solid ${typeConfig.color}`,
              boxShadow: `0 4px 12px rgba(0,0,0,0.6), 0 0 20px ${typeConfig.color}40`,
            }}
          >
            {typeConfig.label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(RedStringEdge)
