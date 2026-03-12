import { AnimatePresence } from "framer-motion";
import { useVideoProcessor } from "./hooks/useVideoProcessor";
import { DropZone } from "./components/DropZone";
import { ProcessingStatus } from "./components/ProcessingStatus";
import { VideoPlayer } from "./components/VideoPlayer";

export default function App() {
  const { state, videoUrl, errorMessage, processVideo, reset } =
    useVideoProcessor();

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

          {state === "done" && videoUrl && (
            <VideoPlayer
              key="player"
              videoUrl={videoUrl}
              onReset={reset}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
