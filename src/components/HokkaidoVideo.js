import React, { useEffect, useRef } from 'react';
import { SubtitleController, subtitleConfigs } from '../utils/SubtitleController';

// 传递 quesIconRef 以便 App.js 可以控制它
function HokkaidoVideo({ quesIconRef }) {
  const iframeRef = useRef(null);
  const toggleZoneRef = useRef(null);
  const subtitleContainerRef = useRef(null);
  
  // 使用 useRef 来持有 player 和 controller 实例
  // 这样它们在重新渲染时不会丢失，也不会触发 effect
  const playerRef = useRef(null);
  const subtitleControllerRef = useRef(null);

  useEffect(() => {
    // 确保 window.Vimeo 已经加载
    if (!window.Vimeo || !iframeRef.current || !subtitleContainerRef.current) {
      return;
    }

    // ------------------ 1. 初始化 Vimeo 播放器 ------------------
    const player = new window.Vimeo.Player(iframeRef.current);
    playerRef.current = player;
    
    const toggleZone = toggleZoneRef.current;

    const onToggleClick = () => {
      player.getPaused().then((paused) => {
        if (paused) {
          player.play();
        } else {
          player.pause();
        }
      });
    };

    if (toggleZone) {
      toggleZone.addEventListener('click', onToggleClick);
    }

    // ------------------ 2. 初始化字幕控制器 ------------------
    const subtitleController = new SubtitleController(subtitleConfigs, subtitleContainerRef.current);
    subtitleControllerRef.current = subtitleController;

    player.on('play', () => {
      player.getCurrentTime().then((seconds) => {
        if (seconds <= 0.1) {
          subtitleController.reset();
          subtitleController.start();
        } else {
          if (!subtitleController.started) subtitleController.start();
          else subtitleController.resume();
        }
      }).catch(() => {
        if (!subtitleController.started) subtitleController.start();
        else subtitleController.resume();
      });
    });

    player.on('pause', () => subtitleController.pause());
    player.on('ended', () => subtitleController.reset());
    player.on('seeked', ({ seconds }) => {
      if (seconds <= 0.1) {
        player.getPaused().then((paused) => {
          if (paused) subtitleController.reset();
        });
      }
    });

    // ------------------ 3. 清理 Effect ------------------
    return () => {
      if (toggleZone) {
        toggleZone.removeEventListener('click', onToggleClick);
      }
      
      player.off('play');
      player.off('pause');
      player.off('ended');
      player.off('seeked');
      
      subtitleController.reset();
      
      // 销毁播放器实例
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => {});
        playerRef.current = null;
      }
    };
    
    // 空依赖数组确保这个 effect 只运行一次 (on mount)
  }, []); 

  return (
    <div className="hokkaido-logo-container">
      <img src="assets/Hokkaidologo.svg" alt="Hokkaido Logo" className="hokkaido-logo" />
      <img src="assets/ques.svg" alt="Question Icon" className="ques-icon" ref={quesIconRef} />

      <div
        className="hokkaido-video-container"
        data-custom-fullscreen  // 关键 data 属性，用于自定义全屏JS
        data-sidebar-title="Otaru"
        data-sidebar-subtitle="北海道の魅力：札幌＆小樽"
        data-sidebar-description="小樽は、北海道を代表する港町で、レトロな運河や石造りの倉庫群が魅力です。冬には雪化粧した街並みがロマンチックな雰囲気を醸し出します。"
        data-sidebar-list="雪景色で輝く小樽運河|札幌・すすきののナイトライフ|石造り倉庫とカフェ巡り"
      >
        <div className="vimeo-wrapper">
          <iframe
            ref={iframeRef}
            className="vimeo-iframe"
            src="https://player.vimeo.com/video/1133040806?share=copy&fl=sv&fe=ci&autoplay=0&muted=0&controls=1&title=0&byline=0&portrait=0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Hokkaido Experience"
          ></iframe>
        </div>

        <div
          ref={toggleZoneRef}
          className="vimeo-toggle-hitbox"
          aria-hidden="true"
        ></div>

        <img src="assets/hkdvideo.svg" alt="Video Frame" className="hokkaido-video-frame" />
        <img src="assets/Rectanglecomment.svg" alt="Comment Rectangle" className="rectangle-comment" />

        <div id="hokkaido-subtitles" className="subtitle-container" ref={subtitleContainerRef}></div>
      </div>
    </div>
  );
}

export default HokkaidoVideo;