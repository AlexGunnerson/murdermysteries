"use client"

import { useState } from "react"
import Image from "next/image"

interface Document {
  id: string
  name: string
  description: string
  onClick: () => void
}

interface DocumentStackProps {
  documents: Document[]
  rotating?: number
}

export function DocumentStack({ documents, rotating = 0 }: DocumentStackProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Permanent+Marker&display=swap');
        
        .paper-stack {
          position: relative;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .paper-stack:hover {
          transform: translateY(-4px) scale(1.02);
        }
        
        .text-container {
          position: relative;
          width: 320px;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        
        /* Clipboard image container */
        .clipboard-container {
          position: absolute;
          top: -70px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 490px;
          z-index: -1;
        }
        
        .paper-count {
          font-family: 'Permanent Marker', cursive;
          font-size: 1.5rem;
          color: #2a2a2a;
        }
        
        /* Document Menu */
        .document-menu {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(to bottom, #fefefe 0%, #f5f5f5 100%);
          border: 2px solid #8b7355;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 1000;
        }
        
        .menu-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 999;
        }
        
        .menu-title {
          font-family: 'Courier Prime', monospace;
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #2c2c2c;
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #8b7355;
        }
        
        .document-item {
          background: white;
          border: 1px solid #d0d0d0;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .document-item:hover {
          background: #f9f9f9;
          border-color: #8b7355;
          transform: translateX(4px);
          box-shadow: 0 3px 6px rgba(0,0,0,0.15);
        }
        
        .document-name {
          font-family: 'Courier Prime', monospace;
          font-weight: 700;
          font-size: 1rem;
          color: #2c2c2c;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .document-description {
          font-family: 'Courier Prime', monospace;
          font-size: 0.85rem;
          color: #666;
          line-height: 1.4;
        }
        
        .close-button {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #8b7355;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .close-button:hover {
          background: #6d5a47;
        }
        
        @media (max-width: 768px) {
          .text-container {
            width: 240px;
            min-height: 190px;
          }
          
          .paper-count {
            font-size: 1.1rem;
          }
          
          .clipboard-container {
            width: 340px;
            height: 420px;
            top: -55px;
          }
        }
      `}</style>

      {/* Clipboard with Text */}
      <div
        className="paper-stack"
        onClick={() => setIsOpen(true)}
        style={{ transform: `rotate(${rotating}deg)` }}
      >
        {/* Clipboard Image */}
        <div className="clipboard-container">
          <Image
            src="/cases/case01/images/ui/clipboard.png"
            alt="Clipboard"
            fill
            className="object-contain"
            sizes="380px"
          />
        </div>

        {/* Text written on clipboard paper */}
        <div className="text-container">
          <div className="paper-count">{documents.length} files</div>
        </div>
      </div>

      {/* Document Selection Menu */}
      {isOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setIsOpen(false)} />
          <div className="document-menu" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              ×
            </button>
            <div className="menu-title">📋 Select Document</div>
            <div>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="document-item"
                  onClick={() => {
                    setIsOpen(false)
                    doc.onClick()
                  }}
                >
                  <div className="document-name">
                    📄 {doc.name}
                  </div>
                  <div className="document-description">
                    {doc.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

