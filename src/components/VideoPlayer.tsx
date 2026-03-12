import { useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { ProcessorData, FrameDetections } from "../hooks/useVideoProcessor";

interface VideoPlayerProps {
  data: ProcessorData;
  onReset: () => void;
}

const CLASS_ORDER = [
  "car", "pedestrian", "people", "van", "truck",
  "motor", "bicycle", "bus", "tricycle", "awning-tricycle",
];

const CLASS_LABELS: Record<string, string> = {
  "pedestrian":     "Peatón",
  "people":         "Personas",
  "bicycle":        "Bicicleta",
  "car":            "Auto",
  "van":            "Camioneta",
  "truck":          "Camión",
  "tricycle":       "Triciclo",
  "awning-tricycle":"Triciclo c/toldo",
  "bus":            "Bus",
  "motor":          "Moto",
};

function ClassIcon({ cls }: { cls: string }) {
  const props = {
    width: 18, height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (cls) {
    case "pedestrian":
      return (
        <svg {...props}>
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v6l-3 4m3-4 3 4M9 11l6-1" />
        </svg>
      );
    case "people":
      return (
        <svg {...props}>
          <circle cx="9" cy="5" r="2" />
          <path d="M9 7v5l-2 4m2-4 2 4M7 10l4-1" />
          <circle cx="16" cy="5" r="2" />
          <path d="M16 7v5l-2 4m2-4 2 4M14 10l4-1" />
        </svg>
      );
    case "bicycle":
      return (
        <svg {...props}>
          <circle cx="6" cy="15" r="4" />
          <circle cx="18" cy="15" r="4" />
          <path d="M6 15 10 6h4l2 5H6" />
          <path d="M10 6 12 9" />
        </svg>
      );
    case "car":
      return (
        <svg {...props}>
          <rect x="2" y="10" width="20" height="8" rx="2" />
          <path d="M6 10 8 5h8l2 5" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      );
    case "van":
      return (
        <svg {...props}>
          <rect x="2" y="8" width="20" height="10" rx="2" />
          <path d="M14 8V5H6L2 8" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
          <line x1="14" y1="8" x2="14" y2="14" />
        </svg>
      );
    case "truck":
      return (
        <svg {...props}>
          <rect x="1" y="9" width="15" height="9" rx="1" />
          <path d="M16 12h4l2 4v2h-6V12Z" />
          <circle cx="5.5" cy="18.5" r="1.5" />
          <circle cx="18.5" cy="18.5" r="1.5" />
        </svg>
      );
    case "tricycle":
      return (
        <svg {...props}>
          <circle cx="5" cy="17" r="3" />
          <circle cx="19" cy="17" r="3" />
          <circle cx="12" cy="17" r="3" />
          <path d="M5 17 10 9h4l2 8" />
        </svg>
      );
    case "awning-tricycle":
      return (
        <svg {...props}>
          <path d="M5 10h14l-1 3H6L5 10Z" />
          <line x1="5" y1="10" x2="4" y2="7" />
          <line x1="19" y1="10" x2="20" y2="7" />
          <circle cx="5" cy="17" r="2.5" />
          <circle cx="19" cy="17" r="2.5" />
          <circle cx="12" cy="17" r="2.5" />
          <line x1="5" y1="14.5" x2="10" y2="13" />
          <line x1="19" y1="14.5" x2="14" y2="13" />
        </svg>
      );
    case "bus":
      return (
        <svg {...props}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="11" x2="22" y2="11" />
          <circle cx="7" cy="19" r="1" />
          <circle cx="17" cy="19" r="1" />
          <line x1="12" y1="5" x2="12" y2="11" />
        </svg>
      );
    case "motor":
      return (
        <svg {...props}>
          <circle cx="6" cy="16" r="4" />
          <circle cx="18" cy="16" r="4" />
          <path d="M6 16 9 9h5l3 7" />
          <path d="M9 9 11 7h2" />
          <circle cx="12" cy="9" r="1.5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <rect x="4" y="8" width="16" height="10" rx="2" />
          <circle cx="8" cy="18" r="2" />
          <circle cx="16" cy="18" r="2" />
        </svg>
      );
  }
}

function formatNumber(n: number): string {
  return n.toLocaleString("es-CL");
}

function DetectionPanel({
  frame,
  currentFrameIdx,
  totalFrames,
  totalDetecciones,
}: {
  frame: FrameDetections | undefined;
  currentFrameIdx: number;
  totalFrames: number;
  totalDetecciones: number;
}) {
  const entries = CLASS_ORDER
    .map((cls) => ({ cls, count: frame?.[cls] ?? 0 }))
    .filter((e) => e.count > 0);

  const maxCount = entries.length > 0 ? Math.max(...entries.map((e) => e.count)) : 1;

  return (
    <div className="detection-panel">
      <div className="frame-counter">
        <div className="frame-counter-main">
          <span className="mono">FRAME</span>
          <span className="frame-number mono">{currentFrameIdx}</span>
          <span className="frame-total mono">/ {totalFrames}</span>
        </div>
        <div className="frame-counter-total">
          <span className="mono">TOTAL DETECCIONES</span>
          <span className="total-number mono">{formatNumber(totalDetecciones)}</span>
        </div>
      </div>

      <div className="detection-divider" />

      <div className="detection-list">
        {entries.length === 0 ? (
          <div className="detection-empty mono">— sin detecciones —</div>
        ) : (
          entries.map(({ cls, count }) => (
            <div key={cls} className="detection-row">
              <div className="detection-icon">
                <ClassIcon cls={cls} />
              </div>
              <div className="detection-info">
                <div className="detection-label-row">
                  <span className="detection-label">{CLASS_LABELS[cls] ?? cls}</span>
                  <span className="detection-count mono">{count}</span>
                </div>
                <div className="detection-bar-track">
                  <div
                    className="detection-bar"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="detection-divider" />

      <div className="panel-footer mono">
        <span>FRAME ACTUAL: {frame?.total ?? 0} det.</span>
      </div>
    </div>
  );
}

export function VideoPlayer({ data, onReset }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);

  const sortedFrameKeys = useMemo(
    () => Object.keys(data.frames).map(Number).sort((a, b) => a - b),
    [data.frames]
  );

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration || isNaN(v.duration) || v.duration === 0) return;
    const idx = Math.floor((v.currentTime / v.duration) * data.totalFrames);
    setCurrentFrameIdx(Math.min(idx, data.totalFrames - 1));
  }, [data.totalFrames]);

  // Find the nearest frame with data when exact key doesn't exist
  const currentFrame: FrameDetections | undefined = useMemo(() => {
    const exact = data.frames[String(currentFrameIdx)];
    if (exact) return exact;
    if (sortedFrameKeys.length === 0) return undefined;
    let lo = 0;
    let hi = sortedFrameKeys.length - 1;
    while (lo < hi - 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (sortedFrameKeys[mid] <= currentFrameIdx) lo = mid;
      else hi = mid;
    }
    const a = sortedFrameKeys[lo];
    const b = sortedFrameKeys[hi];
    const nearestKey =
      Math.abs(a - currentFrameIdx) <= Math.abs(b - currentFrameIdx) ? a : b;
    return data.frames[String(nearestKey)];
  }, [currentFrameIdx, data.frames, sortedFrameKeys]);

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

      <div className="player-layout">
        <div className="player-video-wrap">
          <video
            ref={videoRef}
            src={data.videoSrc}
            loop
            autoPlay
            controls
            playsInline
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        <DetectionPanel
          frame={currentFrame}
          currentFrameIdx={currentFrameIdx}
          totalFrames={data.totalFrames}
          totalDetecciones={data.totalDetecciones}
        />
      </div>
    </motion.div>
  );
}
