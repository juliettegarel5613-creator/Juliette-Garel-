import { useEffect, useRef } from "react";
import type { VoiceConnectionStatus } from "../hooks/useLiveVoice";

interface AcousticOrbProps {
  status: VoiceConnectionStatus;
  isSpeaking: boolean;
  isMuted: boolean;
  getAudioLevels: () => { input: number; output: number };
}

export function AcousticOrb({
  status,
  isSpeaking,
  isMuted,
  getAudioLevels,
}: AcousticOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothedLevelRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId = 0;
    let phase = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = 160;
      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      const levels = getAudioLevels();
      const targetLevel =
        status === "connected"
          ? Math.max(levels.output, isMuted ? 0 : levels.input)
          : 0;

      smoothedLevelRef.current +=
        (targetLevel - smoothedLevelRef.current) * 0.18;
      const level = smoothedLevelRef.current;

      if (!prefersReducedMotion) {
        phase += status === "connected" ? 0.03 + level * 0.06 : 0.008;
      }

      const baseRadius = 42;

      // Outer resonance rings when active
      if (status === "connected" || status === "connecting") {
        const ringCount = 3;
        for (let r = 0; r < ringCount; r++) {
          const expansion =
            status === "connecting"
              ? 8 + r * 9 + Math.sin(phase * 1.4 - r) * 2.5
              : 7 + r * 10 + level * (14 + r * 6);
          const alpha =
            status === "connecting"
              ? 0.14 - r * 0.035
              : Math.max(0.04, 0.18 + level * 0.25 - r * 0.06);

          ctx.beginPath();
          for (let i = 0; i <= 72; i++) {
            const angle = (i / 72) * Math.PI * 2;
            const wave =
              status === "connected" && !prefersReducedMotion
                ? Math.sin(angle * 3 + phase + r) * (level * 3.8)
                : 0;
            const rad = baseRadius + expansion + wave;
            const x = cx + Math.cos(angle) * rad;
            const y = cy + Math.sin(angle) * rad;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = isSpeaking
            ? `rgba(214, 134, 158, ${Math.min(0.65, alpha + 0.15)})`
            : `rgba(59, 35, 20, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        // Poised hairline outer ring at rest
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius + 14, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(59, 35, 20, 0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Inner medallion disc
      const innerRadius =
        baseRadius + (status === "connected" ? level * 4 : 0);
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle =
        status === "connected" && isSpeaking ? "#4E2F1C" : "#3B2314";
      ctx.fill();

      ctx.strokeStyle =
        status === "connected"
          ? "rgba(247, 198, 212, 0.45)"
          : "rgba(59, 35, 20, 0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Monogram label inside disc in pink
      ctx.fillStyle = "#F7C6D4";
      ctx.font =
        '700 26px "Placard Next Compressed", "Barlow Condensed", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("JUUL", cx, cy + 1);

      ctx.restore();

      if (status === "connected" || status === "connecting") {
        animationFrameId = window.requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [status, isSpeaking, isMuted, getAudioLevels]);

  return (
    <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
      <canvas
        ref={canvasRef}
        className="w-40 h-40"
        aria-label="Juul acoustic voice visualization"
      />
    </div>
  );
}
