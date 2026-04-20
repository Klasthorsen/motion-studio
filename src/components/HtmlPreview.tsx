"use client";

import { useEffect, useRef } from "react";

interface HtmlPreviewProps {
  html: string;
  css?: string;
  activeState?: string;
  className?: string;
}

export function HtmlPreview({ html, css, activeState, className }: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const stateClass = activeState && activeState !== "default" ? `state-${activeState}` : "";

    doc.open();
    doc.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: transparent;
    }
    img[src=""], img:not([src]) { display: none; }
    ${css || ""}
  </style>
</head>
<body class="${stateClass}">
  ${html}
</body>
</html>
    `);
    doc.close();

    // Auto-resize iframe to content
    const resize = () => {
      if (!iframeRef.current || !doc.body) return;
      const height = Math.max(doc.body.scrollHeight, 100);
      const width = Math.max(doc.body.scrollWidth, 200);
      iframeRef.current.style.height = `${height}px`;
      iframeRef.current.style.width = `${width}px`;
    };

    setTimeout(resize, 100);
    setTimeout(resize, 500);
  }, [html, css, activeState]);

  return (
    <iframe
      ref={iframeRef}
      className={`border-0 bg-white rounded-lg shadow-lg ${className || ""}`}
      style={{ minHeight: "100px", minWidth: "200px" }}
      sandbox="allow-scripts allow-same-origin"
      title="Component preview"
    />
  );
}
