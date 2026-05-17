import React from 'react';
import { FaBars } from 'react-icons/fa';

const DEFAULT_CATEGORIES = [
  "Today's Deals",
  'Electronics',
  'Fashion',
  'Home',
  'Gaming',
  'Books',
  'Customer Service',
];

function Subnavbar({ categories = DEFAULT_CATEGORIES, onCategoryClick }) {
  return (
    <div className="subnavbar">
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
        <FaBars /> All
      </span>
      {categories.map((cat) => (
        <span
          key={cat}
          onClick={() => onCategoryClick && onCategoryClick(cat)}
        >
          {cat}
        </span>
      ))}
    </div>
  );
}

Subnavbar.defaultProps = {
  categories: DEFAULT_CATEGORIES,
};

export default Subnavbar;
