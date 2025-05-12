import { useEffect, useState } from "react";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

import "highlight.js/styles/github-dark.css";

marked.use(
  markedHighlight({
    // async defaults to false; omit or set true if you really need it
    highlight(code, lang) {
      return lang && hljs.getLanguage(lang)
        ? hljs.highlight(code, { language: lang }).value
        : hljs.highlightAuto(code).value;
    },
  })
);
marked.setOptions({ breaks: true });

type MarkdownViewerProps = { content: string };

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const raw = await marked.parse(content ?? "");
      const safe = DOMPurify.sanitize(raw);
      if (!cancelled) setHtml(safe);
    })();

    return () => {
      cancelled = true;
    };
  }, [content]);

  return (
    <div
      className="m-w-none markdown prose prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
