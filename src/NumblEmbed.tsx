import { useEffect, useRef } from "react";

interface NumblEmbedProps {
  script: string;
}

export function NumblEmbed({ script }: NumblEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const encoded = btoa(script);
    iframeRef.current.src = `https://numbl.org/embed?script=${encoded}&_cb=${Date.now()}`;
  }, [script]);

  return (
    <iframe
      ref={iframeRef}
      width="100%"
      height="100%"
      frameBorder="0"
      style={{ border: "1px solid #ddd", borderRadius: 3 }}
    />
  );
}
