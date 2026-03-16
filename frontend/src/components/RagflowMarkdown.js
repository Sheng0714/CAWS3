import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  p: ({ children }) => (
    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: "0.4em 0", paddingInlineStart: "1.3em" }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "0.4em 0", paddingInlineStart: "1.3em" }}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li style={{ margin: "0.15em 0" }}>{children}</li>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

export default function RagflowMarkdown({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content || ""}
    </ReactMarkdown>
  );
}
