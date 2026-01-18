"use client"

import { VictimDossierView } from "./VictimDossierView"

interface VictimCardProps {
  onClose: () => void
}

// Legacy export - now uses the new VictimDossierView that matches suspect dossier style
export function VictimCard({ onClose }: VictimCardProps) {
  return <VictimDossierView onClose={onClose} />
}

