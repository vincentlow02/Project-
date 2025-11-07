import React from 'react';
import HokkaidoVideo from './HokkaidoVideo';

function MainContent({ isSidebarCollapsed, quesIconRef }) {
  const pageContentClass = `main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`;

  return (
    <main id="page-content" className={pageContentClass}>
      <div className="main-content-canvas">
        <img src="assets/Rectangle205.svg" alt="" className="main-content-background" />

        <div className="hokkaido-layout">
          <HokkaidoVideo quesIconRef={quesIconRef} />
        </div>
      </div>
    </main>
  );
}

export default MainContent;