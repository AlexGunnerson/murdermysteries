// Types for the Investigation Board

export type ConnectionType = 'contradicts' | 'supports' | 'alibi_for' | 'motive'

export interface ConnectionTypeConfig {
  label: string
  color: string
  bgColor: string
}

export const CONNECTION_TYPES: Record<ConnectionType, ConnectionTypeConfig> = {
  contradicts: {
    label: 'Contradicts',
    color: '#f59e0b', // Amber/bronze
    bgColor: '#1a1a1a', // Dark background
  },
  supports: {
    label: 'Supports',
    color: '#22c55e', // Green
    bgColor: '#1a1a1a', // Dark background
  },
  alibi_for: {
    label: 'Alibi',
    color: '#94a3b8', // Muted blue-gray
    bgColor: '#1a1a1a', // Dark background
  },
  motive: {
    label: 'Motive',
    color: '#ef4444', // Bright red for visibility on dark
    bgColor: '#1a1a1a', // Dark background
  },
}

export interface BoardNode {
  id: string
  type: 'suspect' | 'victim' | 'note' | 'photo' | 'document'
  position: { x: number; y: number }
  data: SuspectNodeData | NoteNodeData | PhotoNodeData | DocumentNodeData
  width?: number
  height?: number
}

export interface PhotoNodeData {
  id: string
  imageUrl: string
  title: string
}

export interface DocumentNodeData {
  id: string
  documentId: string
  title: string
  description: string
  thumbnailUrl?: string
  images?: string[]
  documentUrl?: string
  isLetter?: boolean
  isHTML?: boolean
}

export interface SuspectNodeData {
  id: string
  suspectId: string
  name: string
  portraitUrl: string
  isVictim?: boolean
}

export interface NoteNodeData {
  id: string
  content: string
  color: 'yellow' | 'blue' | 'pink' | 'green'
}

export interface BoardConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  connectionType: ConnectionType
  // For connections to empty space
  targetPosition?: { x: number; y: number }
}

export interface InvestigationBoardState {
  nodes: BoardNode[]
  connections: BoardConnection[]
  viewport: { x: number; y: number; zoom: number }
}

// Source ID to friendly name mapping
export const SOURCE_NAME_MAP: Record<string, string> = {
  'veronica_letter': "Veronica's Letter",
  'victim_reginald': 'Victim Profile',
  'suspect_colin': 'Colin Ashcombe',
  'suspect_lydia': 'Lydia Ashcombe',
  'suspect_vale': 'Dr. Edmund Vale',
  'suspect_martin': 'Martin Ashcombe',
  'suspect_veronica': 'Veronica Ashcombe',
  'record_vale_notes': "Dr. Vale's Medical Notes",
  'record_coroner': "Coroner's Report",
  'record_phone_logs': 'Phone Call Logs',
  'record_speech_notes': 'Speech Notes',
  'record_security_footage': 'Security Footage',
  'record_blackmail_portrait': 'Blackmail Documents',
  'record_blackmail_floor': 'Blackmail Documents (Scene)',
  'scene_study': 'The Study',
  'scene_greenhouse': 'The Greenhouse',
  'scene_master_bedroom': 'Master Bedroom',
  'scene_grand_staircase': 'Grand Staircase',
  'scene_ballroom': 'The Ballroom',
}

export function getFriendlySourceName(sourceId: string): string {
  return SOURCE_NAME_MAP[sourceId] || sourceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
