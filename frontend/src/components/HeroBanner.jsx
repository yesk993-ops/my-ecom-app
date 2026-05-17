import React from 'react';

function HeroBanner({ title, subtitle }) {
  return (
    <div className="hero-banner">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

HeroBanner.defaultProps = {
  title: 'Welcome to ShopZone',
  subtitle: 'Discover amazing deals on thousands of products — shop the best prices today!',
};

export default HeroBanner;
