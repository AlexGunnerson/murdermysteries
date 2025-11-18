"use client"

import { ReactNode } from "react"

interface MainContentPanelProps {
  children: ReactNode
  title?: string
}

export function MainContentPanel({ children, title }: MainContentPanelProps) {
  return (
    <div className="flex-1 bg-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <div className="h-1 w-20 bg-blue-500 mt-3 rounded-full"></div>
          </div>
        )}
        <div className="text-gray-200">
          {children}
        </div>
      </div>
    </div>
  )
}

