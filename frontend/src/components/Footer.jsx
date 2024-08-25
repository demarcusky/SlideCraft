import React from 'react';
import { useMatch } from 'react-router-dom';

/**
 * Component which handles the footer of Presto.
 * Background changes based on whether or not user is previewing a presentation.
 */
function Footer () {
  const match = useMatch('/presentation/:key/preview/:slide');
  const isPreview = !!match;

  return (
    <footer style={{ backgroundColor: isPreview ? 'rgba(0, 0, 0, 0.6)' : 'white' }}>
      <span className=" text-muted">© 2024 SlideCraft</span>
    </footer>
  );
}

export default Footer;
