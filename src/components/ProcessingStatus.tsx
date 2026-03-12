import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOG_MESSAGES = [
  "Cargando modelos YOLO (Coarse + Fine)...",
  "Inicializando pipeline Coarse-to-Fine...",
  "Generando cuadrícula de tiles con overlap...",
  "Ejecutando detección global (Coarse)...",
  "Filtrando tiles activos por detecciones...",
  "Procesando tiles con modelo Fine (640px)...",
  "Aplicando NMS global por clase...",
  "Dibujando bounding boxes y etiquetas...",
  "Exportando video procesado...",
];

export function ProcessingStatus() {
  const [visibleLines, setVisibleLines] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) =>
        prev < LOG_MESSAGES.length ? prev + 1 : prev
      );
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="processing-container"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="processing-visual">
        <div className="processing-ring" />
        <div className="processing-ring-spin" />
        <div className="processing-ring-spin-2" />
        <div className="processing-center-dot" />
      </div>

      <div className="processing-info">
        <h2>Analizando video</h2>
        <p className="mono">El procesamiento puede tardar varios minutos</p>
      </div>

      <div className="processing-messages">
        <AnimatePresence initial={false}>
          {LOG_MESSAGES.slice(0, visibleLines).map((msg, i) => {
            const isLast = i === visibleLines - 1;
            return (
              <motion.div
                key={i}
                className={`msg-line${isLast ? " active" : ""}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span className="msg-prefix">
                  {isLast ? "▶" : "✓"}
                </span>
                <span>{msg}</span>
                {isLast && <span className="cursor-blink">_</span>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
