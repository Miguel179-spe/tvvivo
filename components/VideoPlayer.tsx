
import React, { useEffect, useRef, useState } from 'react';
import { Channel } from '../types';

declare const Hls: any;

interface VideoPlayerProps {
  channel: Channel | null;
  onNext: () => void;
  onPrev: () => void;
  toggleFullscreen: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onNext, onPrev, toggleFullscreen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    setLoading(true);
    setError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const video = videoRef.current;
    const url = channel.url;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.warn("Autoplay blocked:", e));
        setLoading(false);
      });
      hls.on(Hls.Events.ERROR, (_: any, data: any) => {
        if (data.fatal) {
          setError(true);
          setLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.warn("Autoplay blocked:", e));
        setLoading(false);
      });
    } else {
      setError(true);
      setLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [channel]);

  return (
    <div className="relative flex-1 h-full bg-black group overflow-hidden">
      {!channel ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-600 space-y-4">
          <svg className="w-24 h-24 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="7" width="20" height="15" rx="2" strokeWidth="1" />
            <path d="M17 2L12 7L7 2" strokeWidth="1" />
          </svg>
          <p className="text-lg font-medium">Selecciona un canal para comenzar</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            onDoubleClick={toggleFullscreen}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
              <div className="text-center p-8 bg-black/60 rounded-2xl border border-neutral-800">
                <p className="text-red-500 font-bold mb-4">Error al cargar el canal</p>
                <button 
                   onClick={() => window.location.reload()}
                   className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Player HUD */}
          <div className="absolute top-0 left-0 w-full p-8 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-xl overflow-hidden backdrop-blur flex items-center justify-center shrink-0">
                {channel.logo && <img src={channel.logo} className="w-full h-full object-contain p-2" alt="" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{channel.name}</h2>
                <p className="text-neutral-400 text-sm uppercase tracking-widest">{channel.group}</p>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-0 right-0 p-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={onPrev} className="p-3 bg-neutral-800/80 hover:bg-blue-600 rounded-lg backdrop-blur transition shadow-xl">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5H7z"/></svg>
             </button>
             <button onClick={onNext} className="p-3 bg-neutral-800/80 hover:bg-blue-600 rounded-lg backdrop-blur transition shadow-xl">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
             </button>
             <button onClick={toggleFullscreen} className="p-3 bg-neutral-800/80 hover:bg-blue-600 rounded-lg backdrop-blur transition shadow-xl">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
             </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
