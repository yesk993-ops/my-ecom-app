import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div>
        <a href="#top" style={{ fontSize: 14 }}>Back to top</a>
      </div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
        <a href="#help">Help Center</a>
        <a href="#gift">Gift Cards</a>
        <a href="#registry">Registry</a>
        <a href="#sell">Sell</a>
        <a href="#business">Business</a>
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
      </div>
      <p>© {new Date().getFullYear()} ShopZone. All rights reserved. This is a demo application.</p>
    </footer>
  );
}

export default Footer;
