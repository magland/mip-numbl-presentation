import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { NumblEmbed } from "./NumblEmbed";
import type { SlideData } from "./parseSlides";

const DESIGN_W = 1200;
const DESIGN_H = 820;
const MOBILE_BREAKPOINT = 820;

interface SlideProps {
  slide: SlideData;
}

export function Slide({ slide }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [mobile, setMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  const fit = useCallback(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;
    const isMobile = parent.clientWidth < MOBILE_BREAKPOINT;
    setMobile(isMobile);
    if (!isMobile) {
      const sx = parent.clientWidth / DESIGN_W;
      const sy = parent.clientHeight / DESIGN_H;
      setScale(Math.min(sx, sy));
    }
  }, []);

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  if (mobile) {
    return (
      <div className="slide slide-mobile">
        <div
          ref={containerRef}
          className={`slide-canvas-mobile${slide.layout === "split" ? " slide-canvas-split-mobile" : ""}`}
        >
          {slide.html && (
            <div
              className="slide-content"
              dangerouslySetInnerHTML={{ __html: slide.html }}
            />
          )}
          {slide.embed && (
            <div className="slide-embed-mobile">
              {"mode" in slide.embed ? (
                <NumblEmbed mode={slide.embed.mode} />
              ) : (
                <NumblEmbed script={slide.embed.script} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="slide">
      <div
        ref={containerRef}
        className={`slide-canvas${slide.layout === "split" ? " slide-canvas-split" : ""}`}
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
        }}
      >
        {slide.html && (
          <div
            className="slide-content"
            style={slide.embed && slide.layout !== "split" ? { marginBottom: "1rem" } : undefined}
            dangerouslySetInnerHTML={{ __html: slide.html }}
          />
        )}
        {slide.embed && (
          <div className="slide-embed">
            {"mode" in slide.embed ? (
              <NumblEmbed mode={slide.embed.mode} />
            ) : (
              <NumblEmbed script={slide.embed.script} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
