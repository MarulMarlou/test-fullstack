import React from 'react';

export default function ItemCard({ item, onClick, selected }) {
  return (
    <div
      className={`item-card ${selected ? 'item-card--selected' : ''}`}
      onClick={() => onClick(item.id)}
    >
      <span>ID: {item.id}</span>
    </div>
  );
}
