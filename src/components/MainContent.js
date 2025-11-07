import React from 'react';
import HokkaidoVideo from './HokkaidoVideo';

function MainContent({ isSidebarCollapsed, quesIconRef }) {
  // 根据 sidebar 状态设置 page-content 的 class
  const pageContentClass = isSidebarCollapsed ? '' : 'sidebar-expanded';
  
  return (
    <main id="page-content" className={pageContentClass}>
      {/* 你的背景 SVG */}
      <img
        src="assets/Rectangle205.svg"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />
      
      {/* 传递 ref */}
      <HokkaidoVideo quesIconRef={quesIconRef} />
      
      {/* 你HTML中的其他 main 内容... */}
    </main>
  );
}

export default MainContent;