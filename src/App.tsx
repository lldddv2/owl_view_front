import { AnimatePresence } from "framer-motion";
import {
  useVideoProcessor,
  type ProcessorData,
} from "./hooks/useVideoProcessor";
import { DropZone } from "./components/DropZone";
import { ProcessingStatus } from "./components/ProcessingStatus";
import { VideoPlayer } from "./components/VideoPlayer";

const DEMO_DATA: ProcessorData = {
  videoSrc:
    "data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAG1wNDFtcDQxaXNvbWF2YzEAAAAIZnJlZQAA...",
  totalFrames: 200,
  totalDetecciones: 8472,
  frames: {
    "0": { total: 4, car: 3, pedestrian: 1 },
    "10": { total: 9, car: 6, pedestrian: 2, motor: 1 },
    "25": { total: 12, car: 8, pedestrian: 3, motor: 1 },
    "60": { total: 7, bus: 1, pedestrian: 4, bicycle: 2 },
    "120": { total: 15, car: 9, van: 3, truck: 2, motor: 1 },
    "160": { total: 11, car: 7, pedestrian: 2, bicycle: 2 },
  },
};

export default function App() {
  const { state, data, errorMessage, processVideo, reset } =
    useVideoProcessor();

  const search = typeof window !== "undefined" ? window.location.search : "";
  const isDemo = search.includes("demo=1");

  if (isDemo) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div className="app-logo">
            <div className="app-logo-icon" />
            <span className="app-logo-name">
              <span>OWL</span> VIEW
            </span>
          </div>
          <span className="app-header-meta">
            <span className="status-dot" />
            MODO DEMO · SIN BACKEND
          </span>
        </header>

        <main className="app-main">
          <VideoPlayer data={DEMO_DATA} onReset={() => {}} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon" />
          <span className="app-logo-name">
            <span>OWL</span> VIEW
          </span>
        </div>
        <span className="app-header-meta">
          <span className="status-dot" />
          SISTEMA ACTIVO · YOLO v8 · COARSE-TO-FINE
        </span>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          {(state === "idle" || state === "error") && (
            <DropZone
              key="dropzone"
              onFileReady={processVideo}
              error={errorMessage}
            />
          )}

          {state === "processing" && (
            <ProcessingStatus key="processing" />
          )}

          {state === "done" && data && (
            <VideoPlayer
              key="player"
              data={data}
              onReset={reset}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
