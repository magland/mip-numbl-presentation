import { marked, Renderer } from "marked";
import hljs from "highlight.js/lib/core";
import matlab from "highlight.js/lib/languages/matlab";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("matlab", matlab);
hljs.registerLanguage("python", python);

const renderer = new Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : undefined;
  const highlighted = language
    ? hljs.highlight(text, { language }).value
    : text;
  return `<pre><code class="hljs${language ? ` language-${language}` : ""}">${highlighted}</code></pre>`;
};

marked.use({ renderer });

export interface SlideData {
  html: string;
  embed?: { script: string };
}

const EMBED_RE = /```numbl-embed\n([\s\S]*?)```/;

export function parseSlides(raw: string): SlideData[] {
  const sections = raw.split(/\n---\n/);
  return sections.map((section) => {
    const trimmed = section.trim();
    const embedMatch = trimmed.match(EMBED_RE);
    if (embedMatch) {
      const withoutEmbed = trimmed.replace(EMBED_RE, "").trim();
      return {
        html: withoutEmbed ? (marked.parse(withoutEmbed) as string) : "",
        embed: { script: embedMatch[1].trim() },
      };
    }
    return { html: marked.parse(trimmed) as string };
  });
}
