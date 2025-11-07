import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function App() {
  // 管理侧边栏的折叠状态
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // 创建 Refs 来引用需要被 JS 操作的 DOM 元素
  const sidebarRef = useRef(null);
  const quesIconRef = useRef(null);

  // ------------------ Effect 0: Body class 管理 ------------------
  useEffect(() => {
    document.body.classList.add('search-results-page');
    return () => {
      document.body.classList.remove('search-results-page');
      document.body.classList.remove('sidebar-collapsed');
      document.body.classList.remove('sidebar-expanded');
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', isSidebarCollapsed);
    document.body.classList.toggle('sidebar-expanded', !isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // ------------------ Effect 1: 水平滚动同步 ------------------
  useEffect(() => {
    const handleScroll = () => {
      // 你的JS是基于 window.scrollX
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      
      // Sidebar 同步
      if (sidebarRef.current) {
        sidebarRef.current.style.left = `${scrollX}px`;
      }
      
      // Ques.svg 同步
      if (quesIconRef.current) {
        const baseLeft = -670; // 来自你的JS
        quesIconRef.current.style.left = `${scrollX + baseLeft}px`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // 清理
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // 空依赖数组，仅在挂载时运行

  // ------------------ Effect 2: 自定义全屏逻辑 ------------------
  // 这是你JS中
  useEffect(() => {
    // 确保 Vimeo API 加载完毕
    if (typeof window.Vimeo === 'undefined' || !window.Vimeo.Player) {
      console.warn("Vimeo Player API not loaded yet.");
      // 可以在这里设置一个短暂的
      return;
    }
    
    // --- 100% 复制粘贴你的 "自定义全屏" JS ---
    const overlay = document.getElementById('custom-fullscreen-overlay');
    if (!overlay) return;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const wrapper = overlay.querySelector('.custom-fullscreen-wrapper');
    const videoViewport = overlay.querySelector('.custom-fullscreen-video-viewport');
    const sidebarContent = overlay.querySelector('.custom-fullscreen-sidebar-content');
    const closeButton = overlay.querySelector('.custom-fullscreen-close');

    if (!videoViewport || !sidebarContent) return;

    const fullscreenContexts = new WeakMap();
    let activeContext = null;

    function populateSidebar(data) {
      sidebarContent.innerHTML = '';
      if (!data) return;

      if (data.title) {
        const titleEl = document.createElement('h2');
        titleEl.textContent = data.title;
        sidebarContent.appendChild(titleEl);
      }
      if (data.subtitle) {
        const subtitleEl = document.createElement('h3');
        subtitleEl.textContent = data.subtitle;
        sidebarContent.appendChild(subtitleEl);
      }
      if (data.description) {
        const descEl = document.createElement('p');
        descEl.textContent = data.description;
        sidebarContent.appendChild(descEl);
      }
      if (data.list && data.list.length) {
        const listEl = document.createElement('ul');
        data.list.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          listEl.appendChild(li);
        });
        sidebarContent.appendChild(listEl);
      }
    }

    function getSidebarData(container) {
      return {
        title: container.getAttribute('data-sidebar-title') || '',
        subtitle: container.getAttribute('data-sidebar-subtitle') || '',
        description: container.getAttribute('data-sidebar-description') || '',
        list: (container.getAttribute('data-sidebar-list') || '')
          .split('|')
          .map((item) => item.trim())
          .filter(Boolean),
      };
    }

    function ensureContext(container) {
      let context = fullscreenContexts.get(container);
      if (!context) {
        context = {
          container,
          originalParent: container.parentNode,
          placeholder: null,
        };
        fullscreenContexts.set(container, context);
      } else if (!context.originalParent || !context.originalParent.isConnected) {
        context.originalParent = container.parentNode;
      }
      return context;
    }

    function ensurePlaceholder(context) {
      const { container } = context;
      if (!context.originalParent) {
        context.originalParent = container.parentNode !== videoViewport ? container.parentNode : context.originalParent;
      }
      if (!context.originalParent) return;
      if (!context.placeholder) {
        context.placeholder = document.createComment('custom-fullscreen-placeholder');
      }
      if (!context.placeholder.parentNode) {
        if (container.parentNode === context.originalParent) {
          context.originalParent.insertBefore(context.placeholder, container);
        } else {
          context.originalParent.appendChild(context.placeholder);
        }
      }
    }

    function moveContainerIntoViewport(container) {
      if (container.parentNode !== videoViewport) {
        while (videoViewport.firstChild) {
          videoViewport.removeChild(videoViewport.firstChild);
        }
        videoViewport.appendChild(container);
      }
    }

    function enterCustomFullscreenFor(container) {
      if (!container) return;
      const context = ensureContext(container);
      if (activeContext && activeContext.container !== container) {
        exitCustomFullscreen();
      }
      ensurePlaceholder(context);
      populateSidebar(getSidebarData(container));
      moveContainerIntoViewport(container);
      overlay.setAttribute('aria-hidden', 'false');
      bodyEl.classList.add('is-custom-fullscreen');
      htmlEl.classList.add('is-custom-fullscreen');
      activeContext = context;
    }

    function exitCustomFullscreen() {
      if (!activeContext) return;
      const { container, placeholder, originalParent } = activeContext;
      overlay.setAttribute('aria-hidden', 'true');
      bodyEl.classList.remove('is-custom-fullscreen');
      htmlEl.classList.remove('is-custom-fullscreen');
      sidebarContent.innerHTML = '';
      const targetParent = (placeholder && placeholder.parentNode) || originalParent || container.parentNode;
      if (targetParent) {
        if (placeholder && placeholder.parentNode === targetParent) {
          targetParent.insertBefore(container, placeholder);
        } else {
          targetParent.appendChild(container);
        }
      }
      activeContext = null;
    }

    const closeClickHandler = () => exitCustomFullscreen();
    const overlayClickHandler = (e) => { if (e.target === overlay) exitCustomFullscreen(); };
    const wrapperClickHandler = (e) => e.stopPropagation();
    const escapeKeyHandler = (e) => { if (e.key === 'Escape') exitCustomFullscreen(); };
    
    closeButton?.addEventListener('click', closeClickHandler);
    overlay.addEventListener('click', overlayClickHandler);
    wrapper?.addEventListener('click', wrapperClickHandler);
    document.addEventListener('keydown', escapeKeyHandler);

    const containers = document.querySelectorAll('[data-custom-fullscreen]');
    const playerMap = new Map(); // 用于清理

    containers.forEach((container) => {
      const iframe = container.querySelector('iframe');
      if (!iframe) return;
      ensureContext(container);
      
      const player = new window.Vimeo.Player(iframe);
      playerMap.set(container, player); // 存储播放器实例

      const onFullscreenChange = (data) => {
        if (data && data.fullscreen) {
          const openCustomFullscreen = () => enterCustomFullscreenFor(container);
          if (typeof player.exitFullscreen === 'function') {
            player
              .exitFullscreen()
              .catch(() => {})
              .then(openCustomFullscreen);
          } else {
            openCustomFullscreen();
          }
        }
      };

      const openHandler = () => enterCustomFullscreenFor(container);
      const closeHandler = () => {
        if (activeContext && activeContext.container === container) {
          exitCustomFullscreen();
        }
      };

      player.on('fullscreenchange', onFullscreenChange);
      container.addEventListener('custom-fullscreen:open', openHandler);
      container.addEventListener('custom-fullscreen:close', closeHandler);
      
      // 存储事件以便清理
      fullscreenContexts.get(container).cleanup = () => {
        player.off('fullscreenchange', onFullscreenChange);
        container.removeEventListener('custom-fullscreen:open', openHandler);
        container.removeEventListener('custom-fullscreen:close', closeHandler);
      };
    });

    // --- Effect 清理函数 ---
    return () => {
      closeButton?.removeEventListener('click', closeClickHandler);
      overlay.removeEventListener('click', overlayClickHandler);
      wrapper?.removeEventListener('click', wrapperClickHandler);
      document.removeEventListener('keydown', escapeKeyHandler);
      
      containers.forEach((container) => {
        const context = fullscreenContexts.get(container);
        if (context && context.cleanup) {
          context.cleanup();
        }
        // 销毁Vimeo播放器实例
        const player = playerMap.get(container);
        if (player) {
          player.destroy().catch(e => console.error("Error destroying Vimeo player:", e));
        }
      });
      
      // 如果全屏处于活动状态，退出
      if (activeContext) {
        exitCustomFullscreen();
      }
    };

  }, []); // 仅在挂载时运行


  return (
    // 你的 body class
    <div className="search-results-page">
      {/* 你的 <section class="page"> */}
      <section className="page" id="searchInterface">
        
        {/* 1. 侧边栏组件 */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          sidebarRef={sidebarRef}
        />
        
        {/* 2. 主内容组件 */}
        <MainContent
          isSidebarCollapsed={isSidebarCollapsed}
          quesIconRef={quesIconRef} // 传递 ref
        />

      </section>

      {/* 3. 自定义全屏遮罩层 (必须在App顶层) */}
      <div id="custom-fullscreen-overlay" className="custom-fullscreen-overlay" aria-hidden="true">
        <div className="custom-fullscreen-wrapper">
          <div className="custom-fullscreen-video-area">
            <div className="custom-fullscreen-video-viewport"></div>
          </div>
          <aside className="custom-fullscreen-sidebar">
            <button type="button" className="custom-fullscreen-close">✖ 关闭</button>
            <div className="custom-fullscreen-sidebar-content"></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;