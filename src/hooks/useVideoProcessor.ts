import { useState, useCallback } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/process_video`;
const MAX_FILE_SIZE_MB = 500;

export type ProcessorState = "idle" | "processing" | "done" | "error";

export interface FrameDetections {
  total: number;
  [cls: string]: number;
}

export interface ProcessorData {
  videoSrc: string;
  totalFrames: number;
  totalDetecciones: number;
  frames: Record<string, FrameDetections>;
}

export interface VideoProcessorResult {
  state: ProcessorState;
  data: ProcessorData | null;
  errorMessage: string | null;
  processVideo: (file: File) => Promise<void>;
  reset: () => void;
}

export function useVideoProcessor(): VideoProcessorResult {
  const [state, setState] = useState<ProcessorState>("idle");
  const [data, setData] = useState<ProcessorData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setErrorMessage(null);
    setState("idle");
  }, []);

  const processVideo = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB.`);
      setState("error");
      return;
    }

    if (!file.type.startsWith("video/")) {
      setErrorMessage("Solo se aceptan archivos de video.");
      setState("error");
      return;
    }

    setState("processing");
    setErrorMessage(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Error del servidor (HTTP ${res.status})`);
      }

      const json = await res.json();

      setData({
        videoSrc: `data:video/mp4;base64,${json.video_base64}`,
        totalFrames: json.total_frames,
        totalDetecciones: json.total_detecciones,
        frames: json.frames,
      });
      setState("done");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error desconocido al procesar el video.";
      setErrorMessage(message);
      setState("error");
    }
  }, []);

  return { state, data, errorMessage, processVideo, reset };
}
