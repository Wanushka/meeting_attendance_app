import React from 'react';

const FooterBar = () => {
  return (
    <div className="footer-title-bar">
      <div className="footer-title-content">
        <span>© 2025 Meeting Attendance App</span>
        <span className="footer-title-divider">•</span>
        <span>Version 1.0</span>
      </div>
      <div className="footer-title-content">
        <a href="#" className="footer-title-link">Terms</a>
        <span className="footer-title-divider">•</span>
        <a href="#" className="footer-title-link">Privacy</a>
      </div>
    </div>
  );
};

export default FooterBar;