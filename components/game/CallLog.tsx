"use client"

import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useGameState } from "@/lib/hooks/useGameState"

interface CallLogProps {
  onClose: () => void
}

export function CallLog({ onClose }: CallLogProps) {
  const { updateChecklistProgress } = useGameState()

  // Track tutorial progress when document is viewed
  useEffect(() => {
    updateChecklistProgress('viewedDocument', true)
  }, [updateChecklistProgress])

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-full pt-4 pb-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Top Left Button */}
      <button
        onClick={onClose}
        className="fixed top-8 left-8 z-[60] p-3 bg-[#f4e8d8] hover:bg-[#e8dcc8] text-gray-800 rounded-full transition-colors shadow-lg"
        aria-label="Back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <style jsx>{`
        .document {
          background: #f4e8d8;
          padding: 50px 40px 40px 40px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          border: 1px solid #8b7355;
          position: relative;
          font-family: 'Courier New', monospace;
        }
        
        .document::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 115, 85, 0.03) 2px,
            rgba(139, 115, 85, 0.03) 4px
          );
          pointer-events: none;
        }
        
        .log-header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          padding-top: 10px;
          margin-bottom: 25px;
          margin-top: 0;
        }
        
        .log-header h1 {
          font-family: 'Georgia', serif;
          font-size: 24px;
          margin: 0 0 5px 0;
          color: #222;
        }
        
        .log-header p {
          margin: 3px 0;
          font-size: 12px;
          color: #222;
        }
        
        .log-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          font-size: 13px;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        
        .log-table th {
          background: #333;
          color: #fff;
          padding: 12px 8px;
          text-align: left;
          border: 1px solid #000;
        }
        
        .log-table td {
          padding: 10px 8px;
          border: 1px solid #999;
          vertical-align: top;
        }
        
        .log-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .label {
          background: #1a1a1a;
          color: #ffffff;
          padding: 12px 20px;
          text-align: center;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 20px;
          width: 100%;
          border-radius: 2px;
          box-shadow: 
            inset 0 1px 1px rgba(255,255,255,0.1),
            0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #333;
          text-transform: uppercase;
          font-size: 14px;
        }
        
        .extension-key {
          background: #f5f5f5;
          padding: 15px;
          margin: 20px 0;
          border-left: 3px solid #333;
          font-size: 12px;
        }
        
        .extension-key p {
          margin: 5px 0;
        }
        
        @media (max-width: 768px) {
          .document {
            padding: 30px 20px 20px 20px;
          }
          
          .log-header h1 {
            font-size: 20px;
          }
          
          .log-header p {
            font-size: 10px;
          }
          
          .log-table {
            font-size: 11px;
          }
          
          .log-table th,
          .log-table td {
            padding: 8px 4px;
          }
          
          .extension-key {
            font-size: 10px;
            padding: 10px;
          }
          
          .label {
            font-size: 12px;
            padding: 8px 15px;
          }
        }
      `}</style>

      <div className="max-w-[900px] mx-auto mt-2 mb-8" onClick={(e) => e.stopPropagation()}>
        <div className="label">TELEPHONE LOG - MAY 10, 1986</div>
        
        <div className="document rounded-sm">
          <div className="log-header">
            <h1>ASHCOMBE ESTATE</h1>
            <p>Private Telephone Exchange Log</p>
            <p>Date: Saturday, May 10, 1986</p>
            <p>Operator on Duty: Mrs. Helen Cartwright</p>
          </div>

          <div className="extension-key" style={{ marginBottom: '30px' }}>
            <strong>Extension Directory:</strong><br />
            <p>Ext. 101 - Main Hall | Ext. 102 - Library | Ext. 103 - Ballroom | Ext. 104 - Kitchen</p>
            <p>Ext. 201 - Master Bedroom | Ext. 202 - Guest Room A (Dr. Vale) | Ext. 203 - Guest Room B (Colin Dorsey)</p>
            <p>Ext. 204 - Guest Room C (Lydia Portwell) | Ext. 205 - Guest Room D (Martin Ashcombe)</p>
            <p>Ext. 301 - Study | Ext. 302 - Greenhouse Office</p>
          </div>

          <table className="log-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Time</th>
                <th style={{ width: '20%' }}>Extension</th>
                <th style={{ width: '30%' }}>Number Dialed</th>
                <th style={{ width: '15%' }}>Duration</th>
                <th style={{ width: '20%' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>9:15 AM</td>
                <td>Ext. 104 (Kitchen)</td>
                <td>Local: 555-2847</td>
                <td>8 min</td>
                <td>Outgoing</td>
              </tr>
              <tr>
                <td>10:32 AM</td>
                <td>Ext. 101 (Main Hall)</td>
                <td>London: 01-492-8834</td>
                <td>12 min</td>
                <td>Outgoing</td>
              </tr>
              <tr>
                <td>11:48 AM</td>
                <td>Ext. 301 (Study)</td>
                <td>Local: 555-7623</td>
                <td>6 min</td>
                <td>Outgoing</td>
              </tr>
              <tr>
                <td>1:22 PM</td>
                <td>Ext. 101 (Main Hall)</td>
                <td>Incoming</td>
                <td>3 min</td>
                <td>Incoming</td>
              </tr>
              <tr>
                <td>2:45 PM</td>
                <td>Ext. 104 (Kitchen)</td>
                <td>Local: 555-2847</td>
                <td>4 min</td>
                <td>Outgoing</td>
              </tr>
              <tr>
                <td>3:18 PM</td>
                <td>Ext. 203 (Guest Room B)</td>
                <td>London: 01-734-6621</td>
                <td>9 min</td>
                <td>Outgoing</td>
              </tr>
              <tr>
                <td>4:52 PM</td>
                <td>Ext. 101 (Main Hall)</td>
                <td>Local: 555-8932</td>
                <td>2 min</td>
                <td>Outgoing</td>
              </tr>
              <tr>
                <td>6:38 PM</td>
                <td>Ext. 104 (Kitchen)</td>
                <td>Local: 555-4419</td>
                <td>5 min</td>
                <td>Outgoing</td>
              </tr>
              <tr>
                <td>7:12 PM</td>
                <td>Ext. 101 (Main Hall)</td>
                <td>Incoming</td>
                <td>2 min</td>
                <td>Incoming</td>
              </tr>
              <tr>
                <td>9:10 PM</td>
                <td>Ext. 101 (Main Hall)</td>
                <td>Emergency: 911</td>
                <td>11 min</td>
                <td>Outgoing</td>
              </tr>
            </tbody>
          </table>

          <p style={{ marginTop: '30px', marginBottom: '10px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
            All calls logged by switchboard operator. Estate extensions require operator connection.
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}

