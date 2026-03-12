import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface VideoPlayerProps {
  videoUrl: string;
  onReset: () => void;
}

export function VideoPlayer({ videoUrl, onReset }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // autoplay blocked by browser policy — user can play manually
      });
    }
  }, [videoUrl]);

  return (
    <motion.div
      className="player-container"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 32 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="player-header">
        <div className="player-title">
          <h2>Resultado del análisis</h2>
          <span className="player-badge">EN BUCLE</span>
        </div>
        <button className="btn-reset" onClick={onReset}>
          ← Analizar otro video
        </button>
      </div>

      <div className="player-video-wrap">
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          autoPlay
          controls
          playsInline
        />
      </div>

      <div className="player-footer">
        <div className="player-meta">
          <span>
            <span className="dot" />
            Reproducción continua activa
          </span>
          <span>Pipeline: Coarse-to-Fine Eagle Eye</span>
        </div>
      </div>
    </motion.div>
  );
}
