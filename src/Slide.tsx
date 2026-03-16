import { useRef, useState, useEffect, useCallback } from "react";
import { NumblEmbed } from "./NumblEmbed";
import type { SlideData } from "./parseSlides";

const DESIGN_W = 1200;
const DESIGN_H = 820;

interface SlideProps {
  slide: SlideData;
}

export function Slide({ slide }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const fit = useCallback(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;
    const sx = parent.clientWidth / DESIGN_W;
    const sy = parent.clientHeight / DESIGN_H;
    setScale(Math.min(sx, sy));
  }, []);

  useEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  return (
    <div className="slide">
      <div
        ref={containerRef}
        className="slide-canvas"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
        }}
      >
        {slide.html && (
          <div
            className="slide-content"
            style={slide.embed ? { marginBottom: "1rem" } : undefined}
            dangerouslySetInnerHTML={{ __html: slide.html }}
          />
        )}
        {slide.embed && (
          <div className="slide-embed">
            <NumblEmbed script={slide.embed.script} />
          </div>
        )}
      </div>
    </div>
  );
}
