import React from "react"
import type { BaseCard } from "../utils/types"

interface SimpleCardProps {
  card: BaseCard
  onClick?: () => void
  disabled?: boolean
  faceDown?: boolean
  selected?: boolean
}

export const SimpleCard: React.FC<SimpleCardProps> = ({
  card,
  onClick,
  disabled = false,
  faceDown = false,
  selected = false,
}) => {
  if (!card || !card.id || !card.name) {
    console.warn("[SimpleCard] Invalid card data:", card)
    return (
      <div
        className="simple-card error"
        style={{
          border: "1px solid #ff0000",
          padding: "10px",
          margin: "5px",
          backgroundColor: "#ffebee",
        }}
      >
        <div>Invalid Card Data</div>
        <div
          className="error-details"
          style={{ fontSize: "0.8em", color: "#666" }}
        >
          {JSON.stringify(card, null, 2)}
        </div>
      </div>
    )
  }

  console.log("[SimpleCard] Rendering card:", {
    id: card.id,
    name: card.name,
    type: card.type,
    faceDown,
  })

  return (
    <div
      className={`simple-card ${selected ? "selected" : ""}`}
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        margin: "5px",
        borderRadius: "5px",
        backgroundColor: faceDown ? "#eee" : "#fff",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1,
        maxWidth: "150px",
      }}
      onClick={disabled ? undefined : onClick}
    >
      {!faceDown ? (
        <>
          <div style={{ fontWeight: "bold" }}>{card.name}</div>
          <div>{card.type}</div>
          <div>{card.value}M</div>
        </>
      ) : (
        <div>Card Face Down</div>
      )}
    </div>
  )
}
