import React, { useState } from "react"
import type { BaseCard, Property } from "../utils/types"
import "../styles/Card.css"
import ErrorBoundary from "./ErrorBoundary"
import { CardActionModal } from "./CardActionModal"

interface CardProps {
  card: BaseCard | Property
  onClick?: () => void
  disabled?: boolean
  faceDown?: boolean
  selected?: boolean
  onSelect?: (selected: boolean) => void
}

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  disabled = false,
  faceDown = false,
  selected = false,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  console.log("[Card Render]", {
    cardId: card?.id,
    type: card?.type,
    name: card?.name,
  })

  if (!card) {
    return null
  }

  const getCardColor = () => {
    if (faceDown) return "#e0e0e0"
    switch (card.type) {
      case "property":
        return (card as Property).color
      case "money":
        return "#e8f5e9"
      case "action":
        return "#fff3e0"
      default:
        return "#ffffff"
    }
  }

  const handleClick = () => {
    if (disabled) return
    setIsModalOpen(true)
  }

  return (
    <ErrorBoundary>
      <div
        className={`card card-${card.type} ${selected ? "selected" : ""} ${
          isHovered ? "hover" : ""
        }`}
        style={{
          borderColor: getCardColor(),
          opacity: disabled ? 0.5 : 1,
          cursor: (onClick || onSelect) && !disabled ? "pointer" : "default",
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`card-inner ${faceDown ? "card-flip" : ""}`}>
          {!faceDown && card ? (
            <>
              <div className="card-header">
                <span className="card-value">{card.value}M</span>
                <span className="card-type">{card.type}</span>
              </div>
              <div className="card-content">
                <h3>{card.name}</h3>
                {card.type === "property" && (
                  <div
                    className="property-color"
                    style={{ backgroundColor: (card as Property).color }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="card-back">
              <span>Monopoly Deal</span>
            </div>
          )}
        </div>
      </div>
      <CardActionModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActionSelect={(action) => {
          if (onSelect) {
            onSelect(!selected)
          }
          onClick?.()
          // Here you can handle different actions based on the selection
          console.log(`Selected action: ${action} for card: ${card.name}`)
        }}
      />
    </ErrorBoundary>
  )
}
