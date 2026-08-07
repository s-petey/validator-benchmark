import type { HighlightedCodeBlockProps } from "@tanstack/highlight/react";
import type { ReactNode } from "react";

export function CodeBlock({
  className,
  copyText,
  htmlMarkup,
  title,
  link,
}: HighlightedCodeBlockProps & { link?: ReactNode }) {
  return (
    <figure className={className}>
      {title ? <figcaption>{title}</figcaption> : null}
      {link ? link : null}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Our own HTML */}
      <div dangerouslySetInnerHTML={{ __html: htmlMarkup }} />
      <button type="button" onClick={() => navigator.clipboard.writeText(copyText)}>
        Copy
      </button>
    </figure>
  );
}
