import { useState, useEffect, useCallback, useRef } from "react";
import { parseSlides } from "./parseSlides";
import { Slide } from "./Slide";
import slidesRaw from "./slides.md?raw";
import "highlight.js/styles/github.css";
import "./App.css";

export default function App() {
  const slides = parseSlides(slidesRaw);
  const [index, setIndex] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    const n = parseInt(hash, 10);
    return Number.isFinite(n) && n >= 0 && n < slides.length ? n : 0;
  });

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => Math.max(0, Math.min(slides.length - 1, i + dir)));
    },
    [slides.length]
  );

  useEffect(() => {
    window.location.hash = String(index);
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        setIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIndex(slides.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Swipe navigation
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      touchStart.current = null;

      // Only count horizontal swipes (ignore vertical scrolling)
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) go(1);
        else go(-1);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [go]);

  return (
    <div className="deck" ref={deckRef}>
      <Slide slide={slides[index]} />
      <nav className="mobile-nav">
        <button
          className="mobile-nav-btn"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <span className="mobile-nav-count">
          {index + 1} / {slides.length}
        </span>
        <button
          className="mobile-nav-btn"
          onClick={() => go(1)}
          disabled={index === slides.length - 1}
          aria-label="Next slide"
        >
          ›
        </button>
      </nav>
      <div className="slide-number">
        {index + 1} / {slides.length}
      </div>
    </div>
  );
}
