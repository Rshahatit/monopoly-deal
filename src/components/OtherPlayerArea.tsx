import React from "react"
import { SimpleCard } from "./SimpleCard"
import type { Schema } from "../../amplify/data/resource"
import { getCardById } from "../utils/cardDefinitions"
import type { BaseCard } from "../utils/types"
import "../styles/OtherPlayerArea.css"

interface OtherPlayerAreaProps {
  playerState: Schema["PlayerGameState"]["type"]
  isCurrentPlayer: boolean
}

export const OtherPlayerArea: React.FC<OtherPlayerAreaProps> = ({
  playerState,
  isCurrentPlayer,
}) => {
  // Group cards by type for better organization
  const propertyCards = playerState.properties
    .filter((cardId): cardId is string => cardId !== null)
    .map((cardId) => ({
      id: cardId,
      card: getCardById(cardId),
    }))

  const bankCards = playerState.bank
    .filter((cardId): cardId is string => cardId !== null)
    .map((cardId) => ({
      id: cardId,
      card: getCardById(cardId),
    }))

  // Calculate total bank value
  const totalBankValue = bankCards.reduce(
    (sum, { card }) => sum + (card?.value || 0),
    0
  )

  return (
    <section
      className={`player-section ${isCurrentPlayer ? "current-player" : ""}`}
    >
      <h3 className="section-title">
        {isCurrentPlayer ? "→ " : ""}Player {playerState.playerId}'s Area
      </h3>

      <div className="other-player-info">
        {/* Hand section */}
        <div className="hand-section">
          <h4>Hand ({playerState.hand.length} cards)</h4>
          <div className="cards-container">
            {playerState.hand.map((cardId) => (
              <SimpleCard
                key={cardId}
                card={
                  {
                    id: cardId,
                    type: "unknown",
                    name: "Hidden",
                    value: 0,
                  } as BaseCard
                }
                disabled={true}
                faceDown={true}
              />
            ))}
          </div>
        </div>

        {/* Properties section */}
        <div className="property-section">
          <h4>Properties ({propertyCards.length})</h4>
          <div className="cards-container">
            {propertyCards.map(({ id, card }) => (
              <SimpleCard
                key={id}
                card={card as BaseCard}
                disabled={true}
                faceDown={false}
              />
            ))}
          </div>
        </div>

        {/* Bank section */}
        <div className="bank-section">
          <h4>Bank (${totalBankValue}M)</h4>
          <div className="cards-container">
            {bankCards.map(({ id, card }) => (
              <SimpleCard
                key={id}
                card={card as BaseCard}
                disabled={true}
                faceDown={false}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
