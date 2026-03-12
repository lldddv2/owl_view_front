import { useState, useCallback, useRef } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/process_video`;
const MAX_FILE_SIZE_MB = 500;

export type ProcessorState = "idle" | "processing" | "done" | "error";

export interface VideoProcessorResult {
  state: ProcessorState;
  videoUrl: string | null;
  errorMessage: string | null;
  processVideo: (file: File) => Promise<void>;
  reset: () => void;
}

export function useVideoProcessor(): VideoProcessorResult {
  const [state, setState] = useState<ProcessorState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    setVideoUrl(null);
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

    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }

    setState("processing");
    setErrorMessage(null);
    setVideoUrl(null);

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

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      prevUrlRef.current = url;
      setVideoUrl(url);
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

  return { state, videoUrl, errorMessage, processVideo, reset };
}
