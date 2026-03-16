import { useState, useEffect, useCallback } from "react";
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
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="deck">
      <Slide slide={slides[index]} />
      <div className="slide-number">
        {index + 1} / {slides.length}
      </div>
    </div>
  );
}
