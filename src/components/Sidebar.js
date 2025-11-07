import React, { useRef, useEffect } from 'react';

// 接收 state 和 setState 函数作为 props
function Sidebar({ isCollapsed, setIsCollapsed, sidebarRef }) {
  const sidebarToggleRef = useRef(null);

  useEffect(() => {
    const toggleButton = sidebarToggleRef.current;
    if (toggleButton) {
      const handleClick = () => {
        setIsCollapsed(prev => !prev);
      };
      
      toggleButton.addEventListener('click', handleClick);
      
      return () => {
        toggleButton.removeEventListener('click', handleClick);
      };
    }
  }, [setIsCollapsed]); // 依赖 setIsCollapsed

  return (
    // 使用 ref 和 className
    <div id="sidebar" className={isCollapsed ? 'collapsed' : ''} ref={sidebarRef}>
      <div className="sidebar-icon-bar">
        <div className="sidebar-item" id="sidebar-toggle" ref={sidebarToggleRef}>
          <div className="icon">
            <img src="assets/arrow-left.svg" alt="Toggle Sidebar" />
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-item">
            <div className="icon">
              <img src="assets/plus.svg" alt="New" />
            </div>
            <span className="sidebar-label">New</span>
          </div>

          <div className="sidebar-item active">
            <div className="icon">
              <img src="assets/search-icon.svg" alt="Home" />
            </div>
            <span className="sidebar-label">ホーム</span>
          </div>

          <div className="sidebar-item">
            <div className="icon">
              <img src="assets/star.svg" alt="Saved" />
            </div>
            <span className="sidebar-label">保存</span>
          </div>

          <div className="sidebar-item">
            <div className="icon">
              <img src="assets/discover.svg" alt="Discover" />
            </div>
            <span className="sidebar-label">発見</span>
          </div>
        </div>
      </div>

      <div className="sidebar-content-panel">
        <div className="panel-header">
          <span className="panel-title">ホーム</span>
          <img src="assets/pin.svg" alt="Pin" />
        </div>

        <div className="panel-section">
          <h3 className="subheader">チャット</h3>
          <ul className="chat-list">
            <li>海外旅行おすすめ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;