import { useEffect, useRef, useState } from 'react';
import './VideoBackground.css';

// Full-screen looping video behind the page. To change the footage, replace the files in
// public/videos/ (background.mp4, plus background.webm as a fallback, and poster.jpg).
export default function VideoBackground() {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.muted = true; // browsers only autoplay muted video
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // People who ask their system for less motion see the still poster instead.
    const syncPlayback = () => {
      if (reduceMotion.matches) video.pause();
      else video.play().catch(() => {});
    };

    syncPlayback();
    reduceMotion.addEventListener('change', syncPlayback);
    return () => reduceMotion.removeEventListener('change', syncPlayback);
  }, []);

  return (
    <div className="video-bg" aria-hidden="true">
      <video
        ref={videoRef}
        className={`video-bg__video${ready ? ' is-ready' : ''}`}
        poster="/videos/poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setReady(true)}
      >
        <source src="/videos/background.mp4" type="video/mp4" />
        <source src="/videos/background.webm" type="video/webm" />
      </video>
      <div className="video-bg__shade" />
    </div>
  );
}
