import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Card } from '../components/Card';

describe('Card', () => {
  const mockCard = {
    id: '123',
    type: 'property' as const,
    name: 'Boardwalk',
    value: 4,
    color: 'blue'
  };

  it('renders the card with correct content', () => {
    const { getByText } = render(<Card card={mockCard} />);
    
    expect(getByText('Boardwalk')).toBeInTheDocument();
    expect(getByText('4M')).toBeInTheDocument();
    expect(getByText('property')).toBeInTheDocument();
  });

  it('renders face down when faceDown prop is true', () => {
    const { getByText, queryByText } = render(<Card card={mockCard} faceDown />);
    
    expect(getByText('Monopoly Deal')).toBeInTheDocument();
    expect(queryByText('Boardwalk')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked and not disabled', () => {
    const handleClick = jest.fn();
    const { container } = render(<Card card={mockCard} onClick={handleClick} />);
    
    fireEvent.click(container.firstChild!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <Card card={mockCard} onClick={handleClick} disabled />
    );
    
    fireEvent.click(container.firstChild!);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies correct styles for different card types', () => {
    const propertyCard = { ...mockCard, type: 'property' as const };
    const moneyCard = { ...mockCard, type: 'money' as const };
    const actionCard = { ...mockCard, type: 'action' as const };

    const { container: propertyContainer } = render(<Card card={propertyCard} />);
    const { container: moneyContainer } = render(<Card card={moneyCard} />);
    const { container: actionContainer } = render(<Card card={actionCard} />);

    expect(propertyContainer.firstChild).toHaveClass('card-property');
    expect(moneyContainer.firstChild).toHaveClass('card-money');
    expect(actionContainer.firstChild).toHaveClass('card-action');
  });
});