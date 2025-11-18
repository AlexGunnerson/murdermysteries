"use client"

interface ActionPanelProps {
  detectivePoints: number
  onAction: (action: string) => void
}

export function ActionPanel({ detectivePoints, onAction }: ActionPanelProps) {
  const actions = [
    { id: "question", label: "Question Suspects", cost: 0, icon: "💬" },
    { id: "records", label: "Check Records", cost: -2, icon: "📄" },
    { id: "scenes", label: "Investigate Scenes", cost: -3, icon: "🔍" },
    { id: "validate", label: "Validate Theory", cost: -3, icon: "🧩" },
    { id: "clue", label: "Get Clue", cost: -2, icon: "💡" },
    { id: "solve", label: "Solve the Murder", cost: 0, icon: "⚖️" },
  ]

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 flex flex-col h-screen sticky top-0">
      {/* Detective Points Display */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-700">
        <div className="text-sm text-blue-300 font-medium">Detective Points</div>
        <div className="text-4xl font-bold text-white mt-1">{detectivePoints}</div>
        <div className="text-xs text-blue-200 mt-2">Use wisely to solve the case</div>
      </div>

      {/* How to Play Button */}
      <button
        onClick={() => onAction("help")}
        className="mb-6 w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
      >
        ❓ How to Play
      </button>

      {/* Action Buttons */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        <div className="text-xs uppercase text-gray-400 font-semibold mb-3">Actions</div>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={action.cost < 0 && detectivePoints < Math.abs(action.cost)}
            className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                    {action.label}
                  </div>
                  {action.cost !== 0 && (
                    <div className={`text-xs ${action.cost > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {action.cost > 0 ? '+' : ''}{action.cost} DP
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
        <button
          onClick={() => onAction("notebook")}
          className="w-full py-2 px-4 text-sm text-gray-400 hover:text-white transition-colors text-left"
        >
          📓 Notebook
        </button>
        <button
          onClick={() => onAction("menu")}
          className="w-full py-2 px-4 text-sm text-gray-400 hover:text-white transition-colors text-left"
        >
          ⚙️ Menu
        </button>
      </div>
    </div>
  )
}

