import { useEffect, useRef } from "react";

type NumblEmbedProps =
  | { script: string; mode?: never }
  | { script?: never; mode: "repl" };

export function NumblEmbed(props: NumblEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    if (props.mode === "repl") {
      iframeRef.current.src = `https://numbl.org/embed-repl`;
    } else {
      const encoded = btoa(props.script);
      iframeRef.current.src = `https://numbl.org/embed?script=${encoded}&_cb=${Date.now()}`;
    }
  }, [props.mode, props.script]);

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
