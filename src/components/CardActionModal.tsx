import React from "react";
import { BaseCard, Property } from "../utils/types";
import "../styles/CardActionModal.css";

interface CardActionModalProps {
  card: BaseCard | Property;
  isOpen: boolean;
  onClose: () => void;
  onActionSelect: (action: string) => void;
}

export const CardActionModal: React.FC<CardActionModalProps> = ({
  card,
  isOpen,
  onClose,
  onActionSelect,
}) => {
  if (!isOpen) return null;

  const getAvailableActions = () => {
    switch (card.type) {
      case "property":
        return ["Play as Property", "Use as Money"];
      case "money":
        return ["Play as Money"];
      case "action":
        return ["Play Action"];
      default:
        return [];
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{card.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <h3>Select Action:</h3>
          <div className="action-buttons">
            {getAvailableActions().map((action) => (
              <button
                key={action}
                className="action-button"
                onClick={() => {
                  onActionSelect(action);
                  onClose();
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};